const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Constructor = require("../models/constructors");
const Client = require("../models/clients");
const Project = require("../models/projects");
const bcrypt = require("bcrypt");

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res.json({ result: false, error: "Missing or empty fields" });
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
            firstname: clientData.firstname, // Assurez-vous que ce champ existe dans votre BDD
            lastname: clientData.lastname,
            profilPicture: clientData.profilePicture,
            role: "client",
          });
        });
      } else {
        // Si non trouvé dans Client, vérifier dans Constructor
        Constructor.findOne({ email: req.body.email }).then(
          (constructorData) => {
            if (
              constructorData &&
              bcrypt.compareSync(req.body.password, constructorData.password)
            ) {
              console.log("Constructor token:", constructorData.token); // Debugging log
              console.log(
                "Constructor token before response:",
                constructorData.token
              ); // Debugging log
              res.json({
                result: true,
                constructorId: constructorData._id,
                token: constructorData.token,
                constructorName: constructorData.constructorName,
                profilPicture: constructorData.profilePicture,
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
      console.error("Erreur signin:", err);
      res.json({ result: false, error: "Internal server error" });
    });
});

module.exports = router;
