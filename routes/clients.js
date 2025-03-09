const express = require("express");
const router = express.Router();
require("../models/connection");
const Client = require("../models/clients");
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  Client.find({}).then((clients) => {
    res.json({ result: true, clients });
  });
});

router.get("/:token", (req, res) => {
  Client.findOne({ token: req.params.token }).then((client) => {
    if (client) {
      res.json({ result: true, client });
    } else {
      res.status(404).json({ result: false, error: "Client not found" });
    }
  });
});

router.put("/:token", (req, res) => {
  // Vérifier si les champs nécessaires sont présents
  if (!checkBody(req.body, ["email", "password", "firstname", "lastname"])) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }

  // Rechercher le constructeur par ID
  Client.findOne({ token: req.params.token })
    .then((data) => {
      if (!data) {
        return res.json({ result: false, error: "Client not found" });
      }

      // Mettre à jour les champs du constructeur
      const updateFields = {};

      if (req.body.firstname) updateFields.firstname = req.body.firstname;
      if (req.body.lastname) updateFields.lastname = req.body.lastname;
      if (req.body.email) updateFields.email = req.body.email;
      if (req.body.password) {
        // Hacher le mot de passe avant de le mettre à jour
        updateFields.password = bcrypt.hashSync(req.body.password, 10);
      }

      // Mettre à jour les informations dans la base de données
      Client.findOneAndUpdate({ token: req.params.token }, updateFields, {
        new: true,
      })
        .then((updatedData) => {
          if (!updatedData) {
            return res.json({
              result: false,
              error: "Failed to update the profile",
            });
          }

          // Réponse avec le constructeur mis à jour
          res.json({
            result: true,
            message: "Profile updated successfully",
            client: updatedData,
          });
        })
        .catch((err) => {
          console.error(err);
          res.json({ result: false, error: "Something went wrong" });
        });
    })
    .catch((err) => {
      console.error(err);
      res.json({ result: false, error: "Client not found" });
    });
});

module.exports = router;
