const express = require("express");
const router = express.Router();
const Craftsmen = require("../models/craftsmen");
const Constructor = require("../models/constructors");
const { checkBody } = require("../modules/checkBody");
require("../models/connection");

const fetch = require("node-fetch");
const OPENCAGE_API_KEY = process.env.OPEN_CAGE_API;

// POST - Add a new craftsman
router.post("/", async (req, res) => {
  try {
    if (
      !checkBody(req.body, [
        "craftsmanName",
        "craftsmanAddress",
        "craftsmanZip",
        "craftsmanCity",
        "phoneNumber",
        "constructeurToken",
      ])
    ) {
      return res
        .status(400)
        .json({ result: false, error: "Missing or empty fields" });
    }

    const existing = await Craftsmen.findOne({
      craftsmanName: req.body.craftsmanName,
    });
    if (existing) {
      return res
        .status(409)
        .json({ result: false, error: "Craftsman already exists" });
    }

    const fullAddress = `${req.body.craftsmanAddress}, ${req.body.craftsmanZip} ${req.body.craftsmanCity}`;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      fullAddress
    )}&key=${OPENCAGE_API_KEY}`;

    const response = await fetch(url);
    const geoData = await response.json();

    if (geoData.results.length === 0) {
      return res
        .status(400)
        .json({ result: false, error: "Unable to geocode address" });
    }

    const { lat, lng } = geoData.results[0].geometry;

    const newCraftsman = new Craftsmen({
      craftsmanName: req.body.craftsmanName,
      craftsmanLogo: req.body.craftsmanLogo || "",
      craftsmanAddress: req.body.craftsmanAddress,
      craftsmanZip: req.body.craftsmanZip,
      craftsmanCity: req.body.craftsmanCity,
      craftsmanLat: lat,
      craftsmanLong: lng,
      phoneNumber: req.body.phoneNumber,
    });

    const savedCraftsman = await newCraftsman.save();

    await Constructor.findOneAndUpdate(
      { token: req.body.constructeurToken },
      { $push: { craftsmen: savedCraftsman._id } },
      { new: true }
    );

    return res.status(201).json({ result: true, data: savedCraftsman });
  } catch (error) {
    console.error("Error in POST /craftsmen:", error);
    return res.status(500).json({ result: false, error: "Server error" });
  }
});

// GET - Get all craftsmen linked to a constructor by token
router.get("/:token", async (req, res) => {
  try {
    const constructor = await Constructor.findOne({
      token: req.params.token,
    }).populate("craftsmen");

    if (!constructor) {
      return res
        .status(404)
        .json({ result: false, error: "Constructor not found" });
    }

    return res.status(200).json({ result: true, data: constructor.craftsmen });
  } catch (error) {
    console.error("Error in GET /craftsmen/:token:", error);
    return res.status(500).json({ result: false, error: "Server error" });
  }
});

// PATCH - Update a craftsman by name
router.patch("/:craftsmanName", async (req, res) => {
  try {
    const updated = await Craftsmen.findOneAndUpdate(
      { craftsmanName: req.params.craftsmanName },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ result: false, error: "Craftsman not found" });
    }

    return res.status(200).json({ result: true, data: updated });
  } catch (error) {
    console.error("Error in PATCH /craftsmen:", error);
    return res.status(500).json({ result: false, error: "Server error" });
  }
});

// DELETE - Remove a craftsman by name
router.delete("/:craftsmanName", async (req, res) => {
  try {
    const deleted = await Craftsmen.findOneAndDelete({
      craftsmanName: req.params.craftsmanName,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ result: false, error: "Craftsman not found" });
    }

    await Constructor.updateMany(
      { craftsmen: deleted._id },
      { $pull: { craftsmen: deleted._id } }
    );

    return res.status(200).json({ result: true, data: deleted });
  } catch (error) {
    console.error("Error in DELETE /craftsmen:", error);
    return res.status(500).json({ result: false, error: "Server error" });
  }
});

module.exports = router;
