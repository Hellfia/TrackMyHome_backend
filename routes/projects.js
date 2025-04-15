const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const r2 = require("../modules/r2config");
const Project = require("../models/projects");
const Client = require("../models/clients");
const Constructor = require("../models/constructors");
const { checkBody } = require("../modules/checkBody");

const OPENCAGE_API_KEY = process.env.OPEN_CAGE_API;

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
      "phoneNumber",
      "token",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Vérification du constructeur avec le token
  Constructor.findOne({ _id: req.body.constructeurId, token: req.body.token })
    .then((constructeur) => {
      if (!constructeur) {
        res.json({
          result: false,
          error: "Constructeur introuvable ou token invalide",
        });
        return;
      }

      // Vérification si un client avec cet email existe déjà
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
                  phoneNumber: req.body.phoneNumber,
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
                    messages: [],
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
                    documents: [],
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
                          error:
                            "Erreur lors de la liaison du client au constructeur",
                        });
                      });
                  });
                });
              } else {
                res.json({
                  result: false,
                  error: "Impossible de géocoder l'adresse",
                });
              }
            })
            .catch((error) => {
              console.error("Error during geocoding:", error);
              res.json({
                result: false,
                error: "Erreur avec l'API de géocodage",
              });
            });
        } else {
          res.json({ result: false, error: "Le client existe déjà" });
        }
      });
    })
    .catch((error) => {
      console.error("Error finding constructor:", error);
      res.json({
        result: false,
        error: "Erreur lors de la vérification du constructeur",
      });
    });
});

router.get("/clients/:constructorId/:token", (req, res) => {
  const { constructorId, token } = req.params;

  console.log("Received constructorId:", constructorId); // Debugging log
  console.log("Received token:", token); // Debugging log

  if (!constructorId || !token) {
    console.log("Missing constructorId or token"); // Debugging log
    return res.json({ message: "constructorId et token sont requis." });
  }

  // Vérification du constructeur avec le token
  Constructor.findOne({ _id: constructorId, token: token })
    .then((constructor) => {
      if (!constructor) {
        console.log("Constructor not found or invalid token"); // Debugging log
        return res.json({
          result: false,
          error: "Constructeur non trouvé ou token invalide.",
        });
      }

      // Recherche des projets associés au constructeur validé
      Project.find({ constructeur: constructorId })
        .populate("client")
        .then((data) => {
          console.log("Projects found:", data); // Debugging log
          if (data && data.length > 0) {
            res.json({ result: true, data: data });
          } else {
            res.json({
              result: false,
              error: "Aucun client trouvé pour ce constructeur.",
            });
          }
        });
    })
    .catch((err) => {
      console.error("Error finding constructor:", err); // Debugging log
      res.json({ result: false, error: "Une erreur est survenue." });
    });
});

router.get("/chantier/:clientId/:token", (req, res) => {
  const { clientId, token } = req.params;

  if (!clientId || !token) {
    return res.json({ message: "clientId et token sont requis." });
  }

  // Vérification si le client existe avec le bon token
  Client.findOne({ _id: clientId, token: token })
    .then((client) => {
      if (!client) {
        return res.json({
          result: false,
          error: "Client introuvable ou token invalide.",
        });
      }

      // Recherche du projet correspondant au client
      Project.findOne({ client: clientId })
        .populate("client")
        .populate("constructeur")
        .then((data) => {
          if (data) {
            res.json({ result: true, data: data });
          } else {
            res.json({
              result: false,
              error: "Projet non trouvé pour ce client.",
            });
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la recherche du projet :", err);
          res.json({
            result: false,
            error: "Erreur interne lors de la recherche du projet.",
          });
        });
    })
    .catch((err) => {
      console.error("Erreur lors de la vérification du client :", err);
      res.json({
        result: false,
        error: "Erreur interne lors de la vérification du client.",
      });
    });
});

router.patch("/updateStep/:projectId/:stepId", (req, res) => {
  const { projectId, stepId } = req.params;
  const { status, date, dateEnd, content } = req.body;

  Project.findById(projectId)
    .then((project) => {
      if (!project) {
        return res.json({ result: false, error: "Project not found" });
      }

      // Recherche de l'étape par son ID
      const step = project.steps.id(stepId); // Utilisation de .id() pour chercher par ID de step
      if (!step) {
        return res.json({ result: false, error: "Step not found" });
      }

      // Mise à jour des informations de l'étape
      step.status = status;
      step.date = date;
      step.dateEnd = dateEnd;
      step.content = content;

      // Sauvegarde des modifications
      project
        .save()
        .then(() => {
          res.json({
            result: true,
            message: "Step updated successfully",
            project,
          });
        })
        .catch((error) => {
          console.error("Error updating step:", error);
          res.json({ result: false, error: "Failed to update step" });
        });
    })
    .catch((error) => {
      console.error("Error finding project:", error);
      res.json({ result: false, error: "Failed to find project" });
    });
});

router.get("/:constructorId/:token", (req, res) => {
  const { constructorId, token } = req.params;

  console.log("Received request for projects:", { constructorId, token }); // Log the received parameters

  if (!constructorId || !token) {
    console.log("Missing constructorId or token"); // Log missing parameters
    return res.json({ message: "constructorId et token sont requis." });
  }

  // Vérification si le constructeur existe avec le bon token
  Constructor.findOne({ _id: constructorId, token: token })
    .then((constructor) => {
      if (!constructor) {
        console.log("Constructor not found or invalid token"); // Log if constructor is not found
        return res.json({
          result: false,
          error: "Constructeur introuvable ou token invalide.",
        });
      }

      console.log("Constructor found:", constructor); // Log the found constructor

      // Recherche des projets associés au constructeur
      Project.find({ constructeur: constructorId })
        .then((data) => {
          if (data.length > 0) {
            console.log("Projects found:", data); // Log the found projects
            res.json({ result: true, data: data });
          } else {
            console.log("No projects found for constructor"); // Log if no projects are found
            res.json({
              result: false,
              error: "Aucun projet trouvé pour ce constructeur.",
            });
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la recherche des projets :", err);
          res.json({
            result: false,
            error: "Erreur interne lors de la recherche des projets.",
          });
        });
    })
    .catch((err) => {
      console.error("Erreur lors de la vérification du constructeur :", err);
      res.json({
        result: false,
        error: "Erreur interne lors de la vérification du constructeur.",
      });
    });
});

router.delete("/:projectId", (req, res) => {
  const { projectId } = req.params;

  // Étape 1 : Trouver le projet par son ID
  Project.findById(projectId)
    .then((project) => {
      if (!project) {
        return res.json({ result: false, error: "Project not found" });
      }

      // Étape 2 : Récupérer l'ID du client associé au projet
      const clientId = project.client;

      // Étape 3 : Supprimer le projet
      Project.findByIdAndDelete(projectId)
        .then(() => {
          // Étape 4 : Supprimer le client
          Client.findByIdAndDelete(clientId)
            .then(() => {
              // Supprimer également le client du constructeur
              Constructor.findByIdAndUpdate(
                project.constructeur,
                { $pull: { clients: clientId } },
                { new: true }
              )
                .then(() => {
                  res.json({
                    result: true,
                    message: "Project and client deleted successfully",
                  });
                })
                .catch((error) => {
                  console.error(
                    "Error removing client from constructor:",
                    error
                  );
                  res.json({
                    result: false,
                    error: "Error removing client from constructor",
                  });
                });
            })
            .catch((error) => {
              console.error("Error deleting client:", error);
              res.json({ result: false, error: "Error deleting client" });
            });
        })
        .catch((error) => {
          console.error("Error deleting project:", error);
          res.json({ result: false, error: "Error deleting project" });
        });
    })
    .catch((error) => {
      console.error("Error fetching project:", error);
      res.json({ result: false, error: "Error fetching project" });
    });
});

router.get("/:constructorId", (req, res) => {
  const { constructorId } = req.params;

  if (!constructorId) {
    return res.status(400).json({ error: "Constructor ID is required" });
  }

  Project.find({ constructeur: constructorId })
    .populate("client")
    .then((projects) => {
      if (!projects || projects.length === 0) {
        return res
          .status(404)
          .json({ error: "No projects found for this constructor" });
      }

      res.json({ result: true, data: projects });
    })
    .catch((error) => {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

module.exports = router;
