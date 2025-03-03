const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
require("../models/connection");
const Client = require("../models/clients");

/* GET users listing. */


router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  Client.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

module.exports = router;
