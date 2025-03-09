const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Constructor = require("../models/constructors");
const Client = require("../models/clients");
const bcrypt = require("bcrypt");

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Vérification dans la collection Client
  Client.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        clientId: data._id,
        token: data.token,
        role: "client",
      });
    } else {
      // Si pas trouvé dans Client, vérifie dans Constructor
      Constructor.findOne({ email: req.body.email }).then((constructorData) => {
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
      });
    }
  });
});

module.exports = router;
