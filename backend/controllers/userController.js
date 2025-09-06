const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');

const User = require("../models/User")

const jwt = require("jsonwebtoken")

const {validationResult} = require("express-validator")

const {
  PEPPER,
  FABRIC_MSP_ID,
  FABRIC_PEER_ENDPOINT,
  FABRIC_TLS_CERT,
  FABRIC_CERT,
  FABRIC_KEY_DIR,
  CHANNEL_NAME,
  CHAINCODE_NAME,
} = process.env;

function deterministicHash({ name, aadharNo, passportNo, email, contactNo, emergencyNo, passwordHashed }, pepper) {
  // Normalize for deterministic hashing (trim/uppercase passport, trim name, strip spaces in contact)
  const canonical = {
    name: String(name || '').trim(),
    passportNo: String(passportNo || '').toUpperCase().replace(/\s+/g, ''),
    contactNo: String(contactNo || '').replace(/\s+/g, '')
  };
  const json = JSON.stringify(canonical); // explicit order in literal above
  return crypto.createHash('sha256').update(json + (pepper || '')).digest('hex');
}

function loadFirstFile(dir) {
  const files = fs.readdirSync(dir);
  if (!files.length) throw new Error(`No files in ${dir}`);
  return path.join(dir, files[0]);
}

function newGrpcConnection() {
  const tlsRootCert = fs.readFileSync(path.resolve(__dirname, "../", FABRIC_TLS_CERT));
  const sslCreds = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(FABRIC_PEER_ENDPOINT, sslCreds);
}

async function newGateway() {
  const client = newGrpcConnection();

  const cert = fs.readFileSync(path.resolve(__dirname, "../", FABRIC_CERT));
  const keyPath = loadFirstFile(path.resolve(__dirname, "../", FABRIC_KEY_DIR));
  const keyPem = fs.readFileSync(keyPath);

  const identity = { mspId: FABRIC_MSP_ID, credentials: cert };
  const signer = signers.newPrivateKeySigner(crypto.createPrivateKey(keyPem));

  return connect({
    client,
    identity,
    signer,
    evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
    endorseOptions: () => ({ deadline: Date.now() + 15000 }),
    submitOptions:  () => ({ deadline: Date.now() + 15000 }),
    commitStatusOptions: () => ({ deadline: Date.now() + 60000 })
  });
}


// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
 const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Fields based on your new schema
  const { name, aadharNo, passportNo, email, contactNo, emergencyNo, passwordHashed } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const hash = deterministicHash({ name, aadharNo, passportNo, email, contactNo, emergencyNo, passwordHashed }, PEPPER);
    const id = uuidv4(); // avoid using passportNo as key
    const metadata = { schemaVersion: 1 };
    const createdAt = new Date().toISOString();

    const gateway = await newGateway();

    let dataBlockHash;

    try {
      const network = gateway.getNetwork(CHANNEL_NAME);
      const contract = network.getContract(CHAINCODE_NAME);

      const resultBytes = await contract.submitTransaction(
        'Put',
        id,
        hash,
        JSON.stringify(metadata),
        createdAt
      );

      const result = JSON.parse(Buffer.from(resultBytes).toString());

      const responseData = {
        id: result.id,
        hash: result.hash,
        createdAt: result.createdAt
      };

      dataBlockHash = responseData.id;

    } finally {
      gateway.close();
    }

    // Create a new user instance
    const newUser = new User({
      name,
      aadharNo,
      passportNo,
      email,
      dataBlockHash,
      contactNo,
      emergencyNo,
      passwordHashed, // Saving the pre-hashed password from the frontend
      photo: req.file ? req.file.path : null, // Assumes you are using multer for file uploads
    });

    const savedUser = await newUser.save();

    // Generate token and send response
    const token = generateToken(savedUser._id);
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        idType: savedUser.aadharNo ? savedUser.aadharNo != null: savedUser.passportNo
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/users/login
 * @access  Public
 */
 const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    const dataHashCalculated = deterministicHash(
      {
        name: user.name,
        aadharNo: user.aadharNo,
        passportNo: user.passportNo,
        email: user.email,
        contactNo: user.contactNo,
        emergencyNo: user.emergencyNo,
        passwordHashed: user.passwordHashed
      },
      PEPPER
    );

    const gateway = await newGateway();
    let dataFromFabric;
    try {
      const network = gateway.getNetwork(CHANNEL_NAME);
      const contract = network.getContract(CHAINCODE_NAME);

      const resultBytes = await contract.evaluateTransaction("Get", user.dataBlockHash);
      dataFromFabric = JSON.parse(Buffer.from(resultBytes).toString());
    } finally {
      gateway.close();
    }

    // 3️⃣ Compare both
    if (dataHashCalculated !== dataFromFabric.hash) {
      return res.status(401).json({ message: "Data integrity check failed" });
    }

    // ⚠️ See the security note below about this comparison
    if (user && user.passwordHashed === password) {
      const token = generateToken(user._id);
      res.status(200).json({
        message: "Logged in successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

const getActiveUsers = async (req, res) => {
  try {
    // Defines "active" as any user whose location was updated in the last 7 days.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const activeUsers = await User.find({
      "lastLocation.timestamp": { $gte: sevenDaysAgo }
    }).select('_id name'); // Only send the ID and name

    res.json(activeUsers);
  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).json({ message: "Server error fetching active users." });
  }
};

module.exports = {registerUser,loginUser,getActiveUsers}