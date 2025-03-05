const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");

const Project = require("../models/projects");
const Client = require("../models/clients");
const { checkBody } = require("../modules/checkBody");
const Constructor = require("../models/constructors");
const Craftsman = require("../models/craftsmen");

router.post("/", (req, res) => {
  if (
    !checkBody(req.body, [
      "firstname",
      "lastname",
      "constructionAdress",
      "constructionZipCode",
      "constructionCity",
      "email",
      "password",
      "constructeurId",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  Constructor.findById(req.body.constructeurId).then((constructeur) => {
    console.log(constructeur);
    if (!constructeur) {
      res.json({ result: false, error: "Constructor not found" });
      return;
    }

    Client.findOne({ email: req.body.email }).then((data) => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);

        const newClient = new Client({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          constructionAdress: req.body.constructionAdress,
          constructionZipCode: req.body.constructionZipCode,
          constructionCity: req.body.constructionCity,
          profilePicture: "",
          email: req.body.email,
          password: hash,
          token: uid2(32),
          role: "client",
        });

        newClient.save().then((clientData) => {
          const newProject = new Project({
            client: clientData._id,
            constructeur: constructeur._id,
            craftsmen: [],
            conversation: { messages: [] },
            documents: [],
            comments: [],
          });

          newProject.save().then((projectData) => {
            res.json({ result: true, project: projectData });
          });
        });
      } else {
        res.json({ result: false, error: "User already exists" });
      }
    });
  });
});

router.get("/clients/:constructorId", (req, res) => {
  const { constructorId } = req.params;

  if (!constructorId) {
    return res.json({ message: "constructorId est requis." });
  }

  Project.find({ constructeur: constructorId })
    .populate("client")
    .then((data) => {
      if (data) {
        res.json({ result: true, data: data });
      } else {
        res.json({ result: false, error: "Client not found !" });
      }
    });
});

router.get("/craftsmen/:constructorId", (req, res) => {
  const { constructorId } = req.params;

  if (!constructorId) {
    return res.json({ message: "constructorId est requis." });
  }

  Project.find({ constructeur: constructorId })
    .populate("Craftsmen")
    .then((data) => {
      if (data) {
        res.json({ result: true, data: data });
      } else {
        res.json({ result: false, error: "Craftsman not found !" });
      }
    });
});

const OPENCAGE_API_KEY = process.env.OPEN_CAGE_API;

router.post("/geocode", (req, res) => {
  const { address } = req.body;

  if (!address) {
    res.json({ result: false, error: "Adresse manquante" });
    return;
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${OPENCAGE_API_KEY}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        res.json({
          result: true,
          location: { latitude: lat, longitude: lng },
        });
      } else {
        res.json({ result: false, error: "Aucun résultat trouvé" });
      }
    });
});

module.exports = router;
