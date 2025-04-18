const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
require("../models/connection");
const Constructor = require("../models/constructors");

// PATCH update constructor by token
router.patch("/:token", async (req, res) => {
  try {
    const constructor = await Constructor.findOne({ token: req.params.token });

    if (!constructor) {
      return res
        .status(404)
        .json({ result: false, error: "Constructor not found" });
    }

    const updateFields = {};

    if (
      req.body.constructorName &&
      req.body.constructorName !== constructor.constructorName
    ) {
      updateFields.constructorName = req.body.constructorName;
    }
    if (
      req.body.constructorSiret &&
      req.body.constructorSiret !== constructor.constructorSiret
    ) {
      updateFields.constructorSiret = req.body.constructorSiret;
    }
    if (req.body.city && req.body.city !== constructor.city) {
      updateFields.city = req.body.city;
    }
    if (req.body.address && req.body.address !== constructor.address) {
      updateFields.address = req.body.address;
    }
    if (req.body.zipCode && req.body.zipCode !== constructor.zipCode) {
      updateFields.zipCode = req.body.zipCode;
    }
    if (
      req.body.phoneNumber &&
      req.body.phoneNumber !== constructor.phoneNumber
    ) {
      updateFields.phoneNumber = req.body.phoneNumber;
    }
    if (req.body.email && req.body.email !== constructor.email) {
      updateFields.email = req.body.email;
    }
    if (req.body.password && req.body.password !== constructor.password) {
      updateFields.password = await bcrypt.hash(req.body.password, 10);
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        result: false,
        error: "No fields to update",
      });
    }

    const updatedConstructor = await Constructor.findOneAndUpdate(
      { token: req.params.token },
      updateFields,
      { new: true }
    );

    if (!updatedConstructor) {
      return res.status(400).json({
        result: false,
        error: "Failed to update the profile",
      });
    }

    return res.status(200).json({
      result: true,
      message: "Profile updated successfully",
      constructor: updatedConstructor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "Server error" });
  }
});

// POST signup constructor
router.post("/signup", async (req, res) => {
  try {
    if (
      !checkBody(req.body, [
        "constructorName",
        "constructorSiret",
        "email",
        "password",
        "city",
        "zipCode",
        "address",
        "phoneNumber",
      ])
    ) {
      return res
        .status(400)
        .json({ result: false, error: "Missing or empty fields" });
    }

    const existing = await Constructor.findOne({ email: req.body.email });

    if (existing) {
      return res
        .status(409)
        .json({ result: false, error: "User already exists" });
    }

    const hash = await bcrypt.hash(req.body.password, 10);

    const newConstructor = new Constructor({
      constructorName: req.body.constructorName,
      constructorSiret: req.body.constructorSiret,
      email: req.body.email,
      password: hash,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      zipCode: req.body.zipCode,
      city: req.body.city,
      clients: [],
      profilePicture: "",
      token: uid2(32),
      role: "constructeur",
    });

    const saved = await newConstructor.save();

    return res.status(201).json({
      result: true,
      constructorId: saved._id,
      token: saved.token,
      role: saved.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      result: false,
      error: "Server error during sign-up",
    });
  }
});

// GET constructor by token
router.get("/:token", async (req, res) => {
  try {
    const constructor = await Constructor.findOne({
      token: req.params.token,
    }).populate("craftsmen"); // ← magie ici ✨

    if (!constructor) {
      return res.status(404).json({ result: false, error: "Invalid token." });
    }

    return res.status(200).json({ result: true, data: constructor });
  } catch (error) {
    console.error("Error fetching constructor:", error);
    return res.status(500).json({ result: false, error: "Server error" });
  }
});

module.exports = router;
