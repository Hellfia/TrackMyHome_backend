const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
require("../models/connection");
const Constructor = require("../models/constructors");

router.put("/:token", (req, res) => {
  // Vérifier si les champs nécessaires sont présents
  if (
    !checkBody(req.body, [
      "email",
      "password",
      "constructorSiret",
      "constructorName",
    ])
  ) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }

  // Rechercher le constructeur par ID
  Constructor.findOne({ token: req.params.token })
    .then((data) => {
      console.log("lol", data);
      if (!data) {
        return res.json({ result: false, error: "Constructor not found" });
      }

      // Mettre à jour les champs du constructeur
      const updateFields = {};

      if (req.body.constructorName)
        updateFields.constructorName = req.body.constructorName;
      if (req.body.constructorSiret)
        updateFields.constructorSiret = req.body.constructorSiret;
      if (req.body.email) updateFields.email = req.body.email;
      if (req.body.password) {
        // Hacher le mot de passe avant de le mettre à jour
        updateFields.password = bcrypt.hashSync(req.body.password, 10);
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
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  Constructor.findOne({ email: req.body.email }).then((dbData) => {
    if (dbData === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const NewConstructor = new Constructor({
        constructorName: req.body.constructorName,
        constructorSiret: req.body.constructorSiret,
        email: req.body.email,
        password: hash,
        profilePicture: "",
        token: uid2(32),
        role: "constructeur",
      });

      NewConstructor.save().then(() => {
        res.json({ result: true });
      });
    } else {
      res.json({ result: false, error: "User already exists" });
    }
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  Constructor.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
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
