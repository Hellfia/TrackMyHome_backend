const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
require("../models/connection");
const Client = require("../models/clients");

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

module.exports = router;
