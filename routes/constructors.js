const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
require("../models/connection");
const Constructor = require("../models/constructors");

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

module.exports = router;
