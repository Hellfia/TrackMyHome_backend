var express = require("express");
var router = express.Router();

/* GET users listing. */
router.post("/signup", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }
  User.findOne({ name: { $regex: new RegExp(req.body.name, "i") } }).then(
    (dbData) => {
      if (dbData === null) {
        const NewUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          role: req.body.role,
        });

        NewUser.save().then(() => {
          res.json({ result: true });
        });
      } else {
        res.json({ result: false, error: "User already exists" });
      }
    }
  );
});

router.post("/signin", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }
  User.findOne({ email: req.body.email, password: req.body.password }).then(
    (data) => {
      if (data) {
        res.json({ result: true });
      } else {
        res.json({ result: false, error: "User not found" });
      }
    }
  );
});

module.exports = router;
