const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const fetch = require("node-fetch");
const r2 = require("../modules/r2config");
const Project = require("../models/projects");
const Client = require("../models/clients");
const Constructor = require("../models/constructors");
const { checkBody } = require("../modules/checkBody");

const OPENCAGE_API_KEY = process.env.OPEN_CAGE_API;

// POST / - Créer un client + projet
router.post("/", async (req, res) => {
  try {
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
      return res
        .status(400)
        .json({ result: false, error: "Missing or empty fields" });
    }

    const { email, password, constructeurId, token } = req.body;

    const constructeur = await Constructor.findOne({
      _id: constructeurId,
      token,
    });
    if (!constructeur)
      return res.status(404).json({
        result: false,
        error: "Constructeur introuvable ou token invalide",
      });

    const existingClient = await Client.findOne({ email });
    if (existingClient)
      return res
        .status(409)
        .json({ result: false, error: "Le client existe déjà" });

    const fullAddress = `${req.body.constructionAdress}, ${req.body.constructionZipCode} ${req.body.constructionCity}`;
    const geoRes = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        fullAddress
      )}&key=${OPENCAGE_API_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results.length) {
      return res
        .status(400)
        .json({ result: false, error: "Impossible de géocoder l'adresse" });
    }

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
      email,
      password: await bcrypt.hash(password, 10),
      token: uid2(32),
      role: "client",
    });

    const savedClient = await newClient.save();

    const stepTemplate = [
      "Études préliminaires",
      "Préparation du terrain",
      "Fondations",
      "Élévation des murs",
      "Charpente et toiture",
      "Menuiseries extérieures",
      "Isolation et cloisonnement",
      "Plomberie, électricité",
      "Revêtements",
      "Finitions",
      "Réception des travaux",
    ].map((name) => ({
      name,
      date: "",
      dateEnd: "",
      status: "À venir",
      uri: "",
      content: "",
    }));

    const newProject = new Project({
      client: savedClient._id,
      constructeur: constructeur._id,
      craftsmen: [],
      messages: [],
      steps: stepTemplate,
      documents: [],
    });

    const savedProject = await newProject.save();

    await Constructor.findByIdAndUpdate(constructeurId, {
      $push: { clients: savedClient._id },
    });

    return res.status(201).json({ result: true, project: savedProject });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      result: false,
      error: "Erreur serveur lors de la création du projet",
    });
  }
});

// GET /clients/:constructorId/:token - Liste des clients d'un constructeur
router.get("/clients/:constructorId/:token", async (req, res) => {
  const { constructorId, token } = req.params;

  try {
    if (!constructorId || !token) {
      return res
        .status(400)
        .json({ result: false, error: "constructorId et token sont requis." });
    }

    const constructor = await Constructor.findOne({
      _id: constructorId,
      token,
    });
    if (!constructor) {
      return res.status(404).json({
        result: false,
        error: "Constructeur non trouvé ou token invalide.",
      });
    }

    const projects = await Project.find({
      constructeur: constructorId,
    }).populate("client");
    if (!projects.length) {
      return res.status(404).json({
        result: false,
        error: "Aucun client trouvé pour ce constructeur.",
      });
    }

    return res.status(200).json({ result: true, data: projects });
  } catch (error) {
    console.error("Erreur dans GET /clients/:constructorId/:token :", error);
    return res
      .status(500)
      .json({ result: false, error: "Erreur interne du serveur." });
  }
});

// GET /chantier/:clientId/:token - Récupère le projet d'un client
router.get("/chantier/:clientId/:token", async (req, res) => {
  const { clientId, token } = req.params;

  try {
    if (!clientId || !token) {
      return res
        .status(400)
        .json({ result: false, error: "clientId et token sont requis." });
    }

    const client = await Client.findOne({ _id: clientId, token });
    if (!client) {
      return res.status(404).json({
        result: false,
        error: "Client introuvable ou token invalide.",
      });
    }

    const project = await Project.findOne({ client: clientId })
      .populate("client")
      .populate("constructeur");

    if (!project) {
      return res
        .status(404)
        .json({ result: false, error: "Projet non trouvé pour ce client." });
    }

    return res.status(200).json({ result: true, data: project });
  } catch (error) {
    console.error("Erreur dans GET /chantier/:clientId/:token :", error);
    return res.status(500).json({
      result: false,
      error: "Erreur interne lors de la récupération du projet.",
    });
  }
});

router.patch("/updateStep/:projectId/:stepId", async (req, res) => {
  const { projectId, stepId } = req.params;
  const { status, date, dateEnd, content } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ result: false, error: "Project not found" });
    }

    const step = project.steps.id(stepId);
    if (!step) {
      return res.status(404).json({ result: false, error: "Step not found" });
    }

    step.status = status;
    step.date = date;
    step.dateEnd = dateEnd;
    step.content = content;

    await project.save();

    return res.status(200).json({
      result: true,
      message: "Step updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error updating step:", error);
    return res
      .status(500)
      .json({ result: false, error: "Failed to update step" });
  }
});

// GET /:constructorId/:token - Récupérer tous les projets d'un constructeur
router.get("/:constructorId/:token", async (req, res) => {
  const { constructorId, token } = req.params;

  try {
    if (!constructorId || !token) {
      return res
        .status(400)
        .json({ result: false, error: "constructorId et token sont requis." });
    }

    const constructor = await Constructor.findOne({
      _id: constructorId,
      token,
    });
    if (!constructor) {
      return res.status(404).json({
        result: false,
        error: "Constructeur introuvable ou token invalide.",
      });
    }

    const projects = await Project.find({ constructeur: constructorId });
    if (!projects.length) {
      return res.status(404).json({
        result: false,
        error: "Aucun projet trouvé pour ce constructeur.",
      });
    }

    return res.status(200).json({ result: true, data: projects });
  } catch (error) {
    console.error("Erreur dans GET /:constructorId/:token :", error);
    return res.status(500).json({
      result: false,
      error: "Erreur interne lors de la récupération des projets.",
    });
  }
});

// DELETE /:projectId - Supprimer un projet et le client associé
router.delete("/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ result: false, error: "Project not found" });
    }

    const clientId = project.client;

    await Project.findByIdAndDelete(projectId);
    await Client.findByIdAndDelete(clientId);

    await Constructor.findByIdAndUpdate(project.constructeur, {
      $pull: { clients: clientId },
    });

    return res.status(200).json({
      result: true,
      message: "Project and client deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project and client:", error);
    return res
      .status(500)
      .json({ result: false, error: "Internal server error" });
  }
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
