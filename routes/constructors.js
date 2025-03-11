const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
require("../models/connection");
const Constructor = require("../models/constructors");

// Route PATCH pour mettre à jour les informations du constructeur
router.patch("/:token", (req, res) => {
  // Rechercher le constructeur par son token
  Constructor.findOne({ token: req.params.token })
    .then((data) => {
      if (!data) {
        return res.json({ result: false, error: "Constructor not found" });
      }

      // Créer un objet pour les champs modifiés
      const updateFields = {};

      if (
        req.body.constructorName &&
        req.body.constructorName !== data.constructorName
      ) {
        updateFields.constructorName = req.body.constructorName;
      }

      if (
        req.body.constructorSiret &&
        req.body.constructorSiret !== data.constructorSiret
      ) {
        updateFields.constructorSiret = req.body.constructorSiret;
      }

      if (req.body.city && req.body.city !== data.city) {
        updateFields.city = req.body.city;
      }
      if (req.body.address && req.body.address !== data.address) {
        updateFields.address = req.body.address;
      }
      if (req.body.zipCode && req.body.zipCode !== data.zipCode) {
        updateFields.zipCode = req.body.zipCode;
      }
      if (req.body.phoneNumber && req.body.phoneNumber !== data.phoneNumber) {
        updateFields.phoneNumber = req.body.phoneNumber;
      }
      if (req.body.email && req.body.email !== data.email) {
        updateFields.email = req.body.email;
      }

      if (req.body.password && req.body.password !== data.password) {
        // Hacher le mot de passe avant de le mettre à jour
        updateFields.password = bcrypt.hashSync(req.body.password, 10);
      }

      // Si aucun champ n'est fourni, retourner une erreur
      if (Object.keys(updateFields).length === 0) {
        return res.json({
          result: false,
          error: "No fields to update",
        });
      }

      // Mettre à jour les informations dans la base de données
      Constructor.findOneAndUpdate({ token: req.params.token }, updateFields, {
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
            constructor: updatedData,
          });
        })
        .catch((err) => {
          console.error(err);
          res.json({ result: false, error: "Something went wrong" });
        });
    })
    .catch((err) => {
      console.error(err);
      res.json({ result: false, error: "Constructor not found" });
    });
});

router.post("/signup", (req, res) => {
  if (
    !checkBody(req.body, [
      "constructorName",
      "constructorSiret",
      "email",
      "password",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  Constructor.findOne({ email: req.body.email })
    .then((dbData) => {
      if (dbData === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);

        const NewConstructor = new Constructor({
          constructorName: req.body.constructorName,
          constructorSiret: req.body.constructorSiret,
          email: req.body.email,
          password: hash,
          phoneNumber: req.body.phoneNumber,
          zipCode: req.body.zipCode,
          address: req.body.address,
          city: req.body.city,
          clients: [],
          profilePicture: "",
          token: uid2(32),
          role: "constructeur",
        });

        NewConstructor.save()
          .then((data) => {
            res.json({
              result: true,
              constructorId: data._id,
              token: data.token,
              role: data.role,
            });
          })
          .catch((error) => {
            res.json({
              result: false,
              error: "Erreur lors de l'enregistrement",
            });
          });
      } else {
        res.json({ result: false, error: "User already exists" });
      }
    })
    .catch((error) => {
      res.json({
        result: false,
        error: "Erreur lors de la recherche de l'utilisateur",
      });
    });
});

router.get("/:token", (req, res) => {
  Constructor.findOne({ token: req.params.token }).then((constructor) => {
    if (constructor) {
      res.json({ result: true, constructor });
    } else {
      res.status(404).json({ result: false, error: "Constructor not found" });
    }
  });
});

module.exports = router;
