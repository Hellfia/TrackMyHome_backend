const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Constructor = require("../models/constructors");
const Client = require("../models/clients");
const Project = require("../models/projects");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Vérification dans la collection Client
  Client.findOne({ email: req.body.email })
    .then((clientData) => {
      if (
        clientData &&
        bcrypt.compareSync(req.body.password, clientData.password)
      ) {
        // Une fois authentifié, recherche du projet lié à ce client
        Project.findOne({ client: clientData._id }).then((project) => {
          res.json({
            result: true,
            clientId: clientData._id,
            projectId: project._id,
            token: clientData.token,
            role: "client",
          });
        });
      } else {
        // Si pas trouvé dans Client, vérifie dans Constructor
        Constructor.findOne({ email: req.body.email }).then(
          (constructorData) => {
            if (
              constructorData &&
              bcrypt.compareSync(req.body.password, constructorData.password)
            ) {
              res.json({
                result: true,
                constructorId: constructorData._id,
                token: constructorData.token,
                role: "constructeur",
              });
            } else {
              res.json({
                result: false,
                error: "User not found or wrong password",
              });
            }
          }
        );
      }
    })
    .catch((err) => {
      res.json({ result: false, error: "Internal server error" });
    });
});

module.exports = router;
