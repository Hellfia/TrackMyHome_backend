const express = require("express");
const Craftsmen = require("../models/craftsmen");
const router = express.Router();
require("../models/connection");
const { checkBody } = require("../modules/checkBody");
const Constructor = require("../models/constructors");

router.post("/", (req, res) => {
  if (
    !checkBody(req.body, [
      "craftsmanName",
      "craftsmanLogo",
      "craftsmanAddress",
      "craftsmanZip",
      "craftsmanCity",
      "phoneNumber",
      "constructeurToken",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  Craftsmen.findOne({ craftsmanName: req.body.craftsmanName }).then(
    (craftsman) => {
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
      newCraftman.save().then((savedCraftsman) => {
        Constructor.findOneAndUpdate(
          { token: req.body.constructeurToken },
          { $push: { craftsmen: savedCraftsman._id } },
          { new: true }
        )
          .then(() => {
            res.json({ result: true, data: savedCraftsman });
          })
          .catch(() => {
            res.json({ result: false, error: "Craftman already exists" });
          });
      });
    }
  );
});

router.get("/:token", (req, res) => {
  Constructor.findOne({ token: req.params.token })
    .populate("craftsmen")
    .then((craftsman) => {
      if (craftsman) {
        res.json({ result: true, data: craftsman.craftsmen });
      } else {
        res.status(404).json({ result: false, error: "Craftsman not found" });
      }
    });
});

module.exports = router;
