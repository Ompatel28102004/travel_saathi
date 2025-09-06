// controllers/aadhar_passport_controller.js
const Aadhar = require("../models/Aadhar");
const Passport = require("../models/Passport");

/**
 * Dummy decentralized verification function
 * (In real-world, this will query blockchain / distributed ledger)
 */
const decentralizedVerify = async (type, idNumber) => {
  console.log(`[Decentralized Mode] Verifying ${type} with number: ${idNumber}`);

  // Dummy example response
  return {
    success: true,
    source: "decentralized",
    message: `${type} verified from decentralized network`,
    data: {
      idNumber,
      name: "Blockchain User",
      mobile: "9999999999",
      email: "dummy@blockchain.com",
      address: "Decentralized Ledger",
      dob: "1990-01-01",
    },
  };
};

/**
 * Centralized verification logic using MongoDB
 */
const centralizedVerify = async (type, idNumber) => {
  let record = null;

  if (type === "aadhar") {
    record = await Aadhar.findOne({ aadharNo: idNumber });
  } else if (type === "passport") {
    record = await Passport.findOne({ passportNo: idNumber });
  }

  if (!record) {
    return { success: false, message: `${type} not found in DB` };
  }

  return {
    success: true,
    source: "centralized",
    message: `${type} verified from centralized DB`,
    data: record,
  };
};

/**
 * Main verification controller
 */
exports.verifyID = async (req, res) => {
  try {
    const { type, idNumber } = req.body;

    if (!type || !idNumber) {
      return res.status(400).json({
        success: false,
        message: "type (aadhar/passport) and idNumber are required",
      });
    }

    // Try centralized (MongoDB) first
    try {
      const result = await centralizedVerify(type, idNumber);
      if (result.success) {
        return res.status(200).json(result);
      } else {
        // If not found in centralized DB, fallback to decentralized
        const fallback = await decentralizedVerify(type, idNumber);
        return res.status(200).json(fallback);
      }
    } catch (dbError) {
      console.error("Centralized verification failed:", dbError);
      // Fallback to decentralized mode in case of DB/server issues
      const fallback = await decentralizedVerify(type, idNumber);
      return res.status(200).json(fallback);
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};
