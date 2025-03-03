const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");

const Constructor = require("../models/constructors");

router.post("/", (req, res) => {
  Constructor.findOne({ email: req.body.email }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newConstructor = new Constructor({
        constructorName: req.body.constructorName,
        constructorAdress: req.body.constructorAdress,
        constructorZip: req.body.constructorZip,
        constructorCity: req.body.constructorCity,
        constructorSiret: req.body.constructorSiret,
        profilePicture: "defaultPictureConstructor.png",
        email: req.body.email,
        password: hash,
        token: uid2(32),
        role: "constructor",
      });

      newConstructor.save().then((data) => {
        res.json({ result: true, constructor: data });
      });
    } else {
      res.json({ result: false, error: "Constructor already exists" });
    }
  });
});

module.exports = router;
