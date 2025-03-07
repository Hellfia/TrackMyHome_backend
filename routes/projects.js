const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");

const Project = require("../models/projects");
const Client = require("../models/clients");
const { checkBody } = require("../modules/checkBody");
const Constructor = require("../models/constructors");

const OPENCAGE_API_KEY = process.env.OPEN_CAGE_API;

// router.post("/", (req, res) => {
//   if (
//     !checkBody(req.body, [
//       "firstname",
//       "lastname",
//       "constructionAdress",
//       "constructionZipCode",
//       "constructionCity",
//       "email",
//       "password",
//       "constructeurId",
//     ])
//   ) {
//     res.json({ result: false, error: "Missing or empty fields" });
//     return;
//   }

//   Constructor.findById(req.body.constructeurId).then((constructeur) => {
//     if (!constructeur) {
//       res.json({ result: false, error: "Constructor not found" });
//       return;
//     }

//     Client.findOne({ email: req.body.email }).then((data) => {
//       if (data === null) {
//         const hash = bcrypt.hashSync(req.body.password, 10);

//         // Adresse complète pour géocodage
//         const fullAddress = `${req.body.constructionAdress}, ${req.body.constructionZipCode} ${req.body.constructionCity}`;
//         const encodedAddress = encodeURIComponent(fullAddress);
//         const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${OPENCAGE_API_KEY}`;

//         // Récupération des coordonnées via l'API OpenCage
//         fetch(url)
//           .then((response) => response.json())
//           .then((geoData) => {
//             if (geoData.results.length > 0) {
//               const { lat, lng } = geoData.results[0].geometry;

//               const newClient = new Client({
//                 firstname: req.body.firstname,
//                 lastname: req.body.lastname,
//                 constructionAdress: req.body.constructionAdress,
//                 constructionZipCode: req.body.constructionZipCode,
//                 constructionCity: req.body.constructionCity,
//                 constructionLat: lat,
//                 constructionLong: lng,
//                 profilePicture: "",
//                 email: req.body.email,
//                 password: hash,
//                 token: uid2(32),
//                 role: "client",
//               });

//               newClient.save().then((clientData) => {
//                 const newProject = new Project({
//                   client: clientData._id,
//                   constructeur: constructeur._id,
//                   craftsmen: [],
//                   conversation: { messages: [] },
//                   documents: [],
//                   comments: [],
//                 });

//                 newProject.save().then((projectData) => {
//                   res.json({ result: true, project: projectData });
//                 });
//               });
//             } else {
//               res.json({ result: false, error: "Unable to geocode address" });
//             }
//           })
//           .catch((error) => {
//             console.error("Error during geocoding:", error);
//             res.json({ result: false, error: "Geocoding API error" });
//           });
//       } else {
//         res.json({ result: false, error: "Client already exists" });
//       }
//     });
//   });
// });

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
    if (!constructeur) {
      res.json({ result: false, error: "Constructor not found" });
      return;
    }

    Client.findOne({ email: req.body.email }).then((data) => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);

        // Adresse complète pour géocodage
        const fullAddress = `${req.body.constructionAdress}, ${req.body.constructionZipCode} ${req.body.constructionCity}`;
        const encodedAddress = encodeURIComponent(fullAddress);
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${OPENCAGE_API_KEY}`;

        // Récupération des coordonnées via l'API OpenCage
        fetch(url)
          .then((response) => response.json())
          .then((geoData) => {
            if (geoData.results.length > 0) {
              const { lat, lng } = geoData.results[0].geometry;

              const newClient = new Client({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                constructionAdress: req.body.constructionAdress,
                constructionZipCode: req.body.constructionZipCode,
                constructionCity: req.body.constructionCity,
                constructionLat: lat,
                constructionLong: lng,
                profilePicture: "",
                email: req.body.email,
                password: hash,
                token: uid2(32),
                role: "client",
              });

              newClient.save().then((clientData) => {
                // Création du projet
                const newProject = new Project({
                  client: clientData._id,
                  constructeur: constructeur._id,
                  craftsmen: [],
                  steps: [
                    {
                      name: "Études préliminaires",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                    {
                      name: "Préparation du terrain",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                    {
                      name: "Fondations",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                    {
                      name: "Élévation des murs",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                    {
                      name: "Charpente et toiture",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                    {
                      name: "Menuiseries extérieures",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                    {
                      name: "Isolation et cloisonnement",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                    {
                      name: "Plomberie, électricité",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                    {
                      name: "Revêtements",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                    {
                      name: "Finitions",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                    {
                      name: "Réception des travaux",
                      date: "",
                      dateEnd: "",
                      status: "À venir",
                      uri: "",
                      content: "",
                    },
                  ],
                  conversation: { messages: [] },
                  documents: [],
                  comments: [],
                });

                newProject.save().then((projectData) => {
                  // Ajout du client au constructeur
                  Constructor.findByIdAndUpdate(
                    req.body.constructeurId,
                    { $push: { clients: clientData._id } },
                    { new: true }
                  )
                    .then(() => {
                      res.json({ result: true, project: projectData });
                    })
                    .catch((error) => {
                      console.error("Error updating constructor:", error);
                      res.json({
                        result: false,
                        error: "Error linking client to constructor",
                      });
                    });
                });
              });
            } else {
              res.json({ result: false, error: "Unable to geocode address" });
            }
          })
          .catch((error) => {
            console.error("Error during geocoding:", error);
            res.json({ result: false, error: "Geocoding API error" });
          });
      } else {
        res.json({ result: false, error: "Client already exists" });
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

module.exports = router;
