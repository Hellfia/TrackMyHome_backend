const express = require("express");
const Craftsmen = require("../models/craftsmen");
const router = express.Router();
require("../models/connection");
const { checkBody } = require("../modules/checkBody");

router.post("/", (req, res) => {
  if (
    !checkBody(req.body, [
      "craftsmanName",
      "craftsmanLogo",
      "craftsmanAddress",
      "craftsmanZip",
      "craftsmanCity",
      "phoneNumber",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  Craftsmen.findOne({ craftsmanName: req.body.craftsmanName }).then(
    (craftsman) => {
      console.log(craftsman);
      if (craftsman) {
        res.json({ result: false, error: "Craftsman not found" });
        return;
      }
      const newCraftman = new Craftsmen({
        craftsmanName: req.body.craftsmanName,
        craftsmanLogo: req.body.craftsmanLogo,
        craftsmanAddress: req.body.craftsmanAddress,
        craftsmanZip: req.body.craftsmanZip,
        craftsmanCity: req.body.craftsmanCity,
        phoneNumber: req.body.phoneNumber,
      });
      newCraftman
        .save()
        .then(() => {
          res.json({ result: true });
        })
        .catch(() => {
          res.json({ result: false, error: "Craftman already exists" });
        });
    }
  );
});


module.exports = router;
