const express = require("express");
const Craftsmen = require("../models/craftsmen");
const router = express.Router();
require("../models/connection");
const { checkBody } = require("../modules/checkBody");
const Constructor = require("../models/constructors");

const OPENCAGE_API_KEY = process.env.OPEN_CAGE_API;

router.post("/", (req, res) => {
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
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  Craftsmen.findOne({ craftsmanName: req.body.craftsmanName }).then(
    (craftsman) => {
      if (craftsman) {
        res.json({ result: false, error: "Craftsman already exists" });
        return;
      }

      // Adresse complète pour géocodage
      const fullAddress = `${req.body.craftsmanAddress}, ${req.body.craftsmanZip} ${req.body.craftsmanCity}`;
      const encodedAddress = encodeURIComponent(fullAddress);
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${OPENCAGE_API_KEY}`;

      fetch(url)
        .then((response) => response.json())
        .then((geoData) => {
          if (geoData.results.length > 0) {
            const { lat, lng } = geoData.results[0].geometry;

            const newCraftman = new Craftsmen({
              craftsmanName: req.body.craftsmanName,
              craftsmanLogo: req.body.craftsmanLogo,
              craftsmanAddress: req.body.craftsmanAddress,
              craftsmanZip: req.body.craftsmanZip,
              craftsmanCity: req.body.craftsmanCity,
              craftsmanLat: lat,
              craftsmanLong: lng,
              phoneNumber: req.body.phoneNumber,
            });

            newCraftman.save().then((savedCraftsman) => {
              // Ajout du craftsman dans le constructeur correspondant
              Constructor.findOneAndUpdate(
                { token: req.body.constructeurToken },
                { $push: { craftsmen: savedCraftsman._id } },
                { new: true }
              )
                .then(() => {
                  res.json({ result: true, data: savedCraftsman });
                })
                .catch((error) => {
                  console.error("Error updating constructor:", error);
                  res.json({
                    result: false,
                    error: "Error linking craftsman to constructor",
                  });
                });
            });
          } else {
            res.json({ result: false, error: "Unable to geocode address" });
          }
        })
        .catch((error) => {
          console.error("Error during geocoding:", error);
          res.json({ result: false, error: "Geocoding API error" });
        });
    }
  );
});

router.get("/:token", (req, res) => {
  Constructor.findOne({ token: req.params.token })
    .populate("craftsmen")
    .then((craftsman) => {
      if (craftsman) {
        res.json({ result: true, data: craftsman.craftsmen });
      } else {
        res.status(404).json({ result: false, error: "Craftsman not found" });
      }
    });
});

// Modifier un artisan par nom
router.patch("/:craftsmanName", (req, res) => {
  const updates = req.body;

  Craftsmen.findOneAndUpdate(
    { craftsmanName: req.params.craftsmanName }, // Recherche par nom
    updates, // Données à mettre à jour
    { new: true } // Retourner l'objet mis à jour
  )
    .then((updatedCraftsman) => {
      if (updatedCraftsman) {
        res.json({ result: true, data: updatedCraftsman });
      } else {
        res.status(404).json({ result: false, error: "Craftsman not found" });
      }
    })
    .catch((error) => {
      console.error("Error updating craftsman:", error);
      res.status(500).json({ result: false, error: "Internal server error" });
    });
});

// Supprimer un artisan par nom
router.delete("/:craftsmanName", (req, res) => {
  Craftsmen.findOneAndDelete({ craftsmanName: req.params.craftsmanName }) // Recherche et suppression
    .then((deletedCraftsman) => {
      if (deletedCraftsman) {
        // Retirer l'artisan du constructeur
        Constructor.updateMany(
          { craftsmen: deletedCraftsman._id },
          { $pull: { craftsmen: deletedCraftsman._id } }
        )
          .then(() => {
            res.json({ result: true, data: deletedCraftsman });
          })
          .catch((error) => {
            console.error("Error removing craftsman from constructor:", error);
            res.status(500).json({
              result: false,
              error: "Error unlinking craftsman from constructor",
            });
          });
      } else {
        res.status(404).json({ result: false, error: "Craftsman not found" });
      }
    })
    .catch((error) => {
      console.error("Error deleting craftsman:", error);
      res.status(500).json({ result: false, error: "Internal server error" });
    });
});

module.exports = router;
