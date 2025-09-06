const Aadhar = require("../models/Aadhar");
const Passport = require("../models/Passport");
const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");

/**
 * Dummy decentralized verification
 */
const decentralizedVerify = async (type, idNumber) => {
  console.log(`[Decentralized Mode] Verifying ${type} with number: ${idNumber}`);
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
 * Centralized DB verification
 */
const centralizedVerify = async (type, idNumber) => {
  let record = null;
  if (type === "aadhaar") {
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
 * Generate random OTP
 */
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Send OTP via Email (Nodemailer)
 */
const sendOTPviaEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // you can switch to SMTP or other providers
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your SecureID OTP",
      text: `Your SecureID OTP is ${otp}. Valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP Email sent to:", email);
    return true;
  } catch (err) {
    console.error("Email send failed:", err.message);
    return false;
  }
};

/**
 * Step 1: Verify ID and send OTP
 */
const verifyID = async (req, res) => {
  try {
    const { type, idNumber } = req.body;

    if (!type || !idNumber) {
      return res
        .status(400)
        .json({ success: false, message: "type and idNumber are required" });
    }

    let result;
    try {
      result = await centralizedVerify(type, idNumber);
      if (!result.success) {
        result = await decentralizedVerify(type, idNumber);
      }
    } catch (dbError) {
      console.error("Centralized verification failed:", dbError);
      result = await decentralizedVerify(type, idNumber);
    }

    if (!result.success) {
      return res.status(404).json(result);
    }

    // Step 2: Generate OTP
    const otp = generateOTP();

    // Store OTP in DB (override old if exists for same email)
    await Otp.findOneAndUpdate(
      { email: result.data.email },
      {
        mobile: result.data.mobile,
        email: result.data.email || "",
        otp,
        data: result.data,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    // Send OTP via Email
    const emailSent = await sendOTPviaEmail(result.data.email, otp);

    return res.status(200).json({
      success: true,
      stage: "OTP_SENT",
      message: emailSent
        ? "ID verified. OTP sent to registered email."
        : "ID verified but OTP sending failed. Please try again.",
      data: {
        idNumber: result.data.idNumber,
        email: result.data.email,
      },
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during verification" });
  }
};

/**
 * Step 2: Verify OTP
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "email and otp are required" });
    }

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "No OTP requested for this email" });
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ email });
      return res
        .status(400)
        .json({ success: false, message: "OTP expired, request again" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Success → delete OTP record
    await Otp.deleteOne({ email });

    return res.status(200).json({
      success: true,
      stage: "VERIFICATION_COMPLETED",
      message: "Final verification successful",
      data: otpRecord.data, // return verified user data
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error verifying OTP" });
  }
};

module.exports = {
  verifyID,
  verifyOTP,
};
