// import mongoose from "mongoose";
const mongoose = require('mongoose')
// import Aadhar from "./model/Aadhar.js";
const Aadhar = require('./model/Aadhar.js')
// import Passport from "./model/Passport.js";
const Passport = require("./model/Passport.js")
mongoose.connect("", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "travelSaathi",
});

async function seedData() {
  await Aadhar.deleteMany({});
  await Passport.deleteMany({});

  // -------------------------
  // AADHAR DATA (8 records)
  // -------------------------
  await Aadhar.insertMany([
    {
      aadharNo: "123412341234",
      name: "Om Patel",
      mobile: "9876543210",
      email: "om@example.com",
      address: "Ahmedabad, Gujarat, India",
      dob: new Date("2000-05-15"),
    },
    {
      aadharNo: "567856785678",
      name: "Riya Shah",
      mobile: "9123456789",
      email: "riya@example.com",
      address: "Mumbai, Maharashtra, India",
      dob: new Date("1998-08-20"),
    },
    {
      aadharNo: "111122223333",
      name: "Karan Joshi",
      mobile: "9811112233",
      email: "karan@example.com",
      address: "Surat, Gujarat, India",
      dob: new Date("1996-07-12"),
    },
    {
      aadharNo: "444455556666",
      name: "Neha Desai",
      mobile: "9822334455",
      email: "neha@example.com",
      address: "Vadodara, Gujarat, India",
      dob: new Date("2001-03-22"),
    },
    {
      aadharNo: "777788889999",
      name: "Rohit Kumar",
      mobile: "9933445566",
      email: "rohit@example.com",
      address: "Lucknow, Uttar Pradesh, India",
      dob: new Date("1994-09-05"),
    },
    {
      aadharNo: "222233334444",
      name: "Anjali Gupta",
      mobile: "9955667788",
      email: "anjali@example.com",
      address: "Jaipur, Rajasthan, India",
      dob: new Date("1999-12-30"),
    },
    {
      aadharNo: "555566667777",
      name: "Vikram Singh",
      mobile: "9877001122",
      email: "vikram@example.com",
      address: "Chandigarh, India",
      dob: new Date("1992-06-18"),
    },
    {
      aadharNo: "888899990000",
      name: "Meera Iyer",
      mobile: "9811223344",
      email: "meera@example.com",
      address: "Chennai, Tamil Nadu, India",
      dob: new Date("2003-04-10"),
    },
  ]);

  // -------------------------
  // PASSPORT DATA (7 records)
  // -------------------------
  await Passport.insertMany([
    {
      passportNo: "M1234567",
      name: "Aarav Mehta",
      mobile: "9812345678",
      email: "aarav@example.com",
      address: "Delhi, India",
      dob: new Date("1995-11-10"),
    },
    {
      passportNo: "N7654321",
      name: "Sneha Verma",
      mobile: "9098765432",
      email: "sneha@example.com",
      address: "Pune, Maharashtra, India",
      dob: new Date("2002-01-25"),
    },
    {
      passportNo: "P2345678",
      name: "Manish Agarwal",
      mobile: "9876001234",
      email: "manish@example.com",
      address: "Kolkata, West Bengal, India",
      dob: new Date("1993-08-14"),
    },
    {
      passportNo: "Q3456789",
      name: "Priya Nair",
      mobile: "9811122233",
      email: "priya@example.com",
      address: "Kochi, Kerala, India",
      dob: new Date("1997-02-19"),
    },
    {
      passportNo: "R4567890",
      name: "Siddharth Malhotra",
      mobile: "9001122334",
      email: "sid@example.com",
      address: "Gurgaon, Haryana, India",
      dob: new Date("1991-05-08"),
    },
    {
      passportNo: "S5678901",
      name: "Tanvi Kapoor",
      mobile: "9123004455",
      email: "tanvi@example.com",
      address: "Shimla, Himachal Pradesh, India",
      dob: new Date("1999-07-27"),
    },
    {
      passportNo: "T6789012",
      name: "Harsh Vardhan",
      mobile: "9344556677",
      email: "harsh@example.com",
      address: "Hyderabad, Telangana, India",
      dob: new Date("2000-10-12"),
    },
  ]);

  console.log("✅ Dummy Aadhar & Passport Data Inserted!");
  mongoose.connection.close();
}

seedData();