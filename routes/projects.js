const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");

const Project = require("../models/projects");
const Client = require("../models/clients");
const { checkBody } = require("../modules/checkBody");
const Constructor = require("../models/constructors");

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
      "constructorId",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  Constructor.findById(req.body.constructorId).then((constructor) => {
    console.log(constructor);
    if (!constructor) {
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
          profilePicture: "defaultPictureClient.png",
          email: req.body.email,
          password: hash,
          token: uid2(32),
          role: "client",
        });

        newClient.save().then((clientData) => {
          const newProject = new Project({
            client: clientData._id,
            constructeur: constructor._id,
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

module.exports = router;
