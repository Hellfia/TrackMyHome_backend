const express = require("express");
const router = express.Router();
require("../models/connection");
const Client = require("../models/clients");
const bcrypt = require("bcrypt");

// GET all clients
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find({});
    return res.status(200).json({ result: true, clients });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "Server error" });
  }
});

// GET a single client by token
router.get("/:token", async (req, res) => {
  try {
    const client = await Client.findOne({ token: req.params.token });
    if (!client) {
      return res.status(404).json({ result: false, error: "Client not found" });
    }
    return res.status(200).json({ result: true, client });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "Server error" });
  }
});

// PATCH update client profile by token
router.patch("/:token", async (req, res) => {
  try {
    const client = await Client.findOne({ token: req.params.token });

    if (!client) {
      return res.status(404).json({ result: false, error: "Client not found" });
    }

    const updateFields = {};

    if (req.body.firstname) updateFields.firstname = req.body.firstname;
    if (req.body.lastname) updateFields.lastname = req.body.lastname;
    if (req.body.email) updateFields.email = req.body.email;
    if (req.body.password) {
      updateFields.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedClient = await Client.findOneAndUpdate(
      { token: req.params.token },
      updateFields,
      { new: true }
    );

    if (!updatedClient) {
      return res
        .status(400)
        .json({ result: false, error: "Failed to update profile" });
    }

    return res.status(200).json({
      result: true,
      message: "Profile updated successfully",
      client: updatedClient,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "Server error" });
  }
});

module.exports = router;
