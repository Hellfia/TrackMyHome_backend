const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const fetch = require("node-fetch");
const r2 = require("../modules/r2config");
const Project = require("../models/projects");
const Client = require("../models/clients");
const Constructor = require("../models/constructors");
const Craftsman = require("../models/craftsmen");
const { checkBody } = require("../modules/checkBody");

const OPENCAGE_API_KEY = process.env.OPEN_CAGE_API;

// POST /:projectId - Upload d'un document dans un projet
router.post("/:projectId", async (req, res) => {
  try {
    const file = req.files?.file;
    if (!file)
      return res
        .status(400)
        .json({ result: false, error: "Aucun fichier fourni" });

    const name = file.name;
    const params = {
      Bucket: process.env.R2_BUCKET_DOCUMENTS,
      Key: name,
      Body: file.data,
      ContentType: file.mimetype,
    };

    await r2.upload(params).promise();
    const imageUrl = `${process.env.R2_PUBLIC_URL}/${name}`;

    const updatedDocument = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        $push: {
          documents: { uri: imageUrl, date: Date.now(), name: file.name },
        },
      },
      { new: true }
    );

    return res.status(200).json({
      result: true,
      documents: updatedDocument.documents,
      project: updatedDocument,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload de document:", error);
    return res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

// GET /documents/:projectId - Récupérer les documents d’un projet
router.get("/documents/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res
        .status(404)
        .json({ result: false, message: "Projet introuvable." });
    }
    return res.status(200).json({ result: true, documents: project.documents });
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return res.status(500).json({ result: false, message: "Erreur serveur." });
  }
});

// DELETE /documents/:projectId/:documentId - Supprimer un document d’un projet
router.delete("/documents/:projectId/:documentId", async (req, res) => {
  try {
    const { projectId, documentId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ result: false, message: "Projet introuvable." });
    }

    const updatedDocuments = project.documents.filter(
      (doc) => doc._id.toString() !== documentId
    );

    if (updatedDocuments.length === project.documents.length) {
      return res
        .status(404)
        .json({ result: false, message: "Document introuvable." });
    }

    project.documents = updatedDocuments;
    const updatedProject = await project.save();

    return res.status(200).json({
      result: true,
      message: "Document supprimé avec succès.",
      documents: updatedProject.documents,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error);
    return res.status(500).json({ result: false, message: "Erreur serveur." });
  }
});

// POST /picture/:clientIdProps/:stepId - Upload image pour une étape d’un projet
router.post("/picture/:clientIdProps/:stepId", async (req, res) => {
  try {
    const file = req.files?.file;
    const { clientIdProps, stepId } = req.params;

    if (!file)
      return res
        .status(400)
        .json({ result: false, error: "Aucun fichier fourni" });

    const name = file.name;
    const params = {
      Bucket: process.env.R2_BUCKET_DOCUMENTS,
      Key: name,
      Body: file.data,
      ContentType: file.mimetype,
    };

    await r2.upload(params).promise();
    const imageUrl = `${process.env.R2_PUBLIC_URL}/${name}`;

    const project = await Project.findOne({ client: clientIdProps });
    if (!project)
      return res
        .status(404)
        .json({ result: false, error: "Projet introuvable" });

    const step = project.steps.find((step) => step._id.toString() === stepId);
    if (!step)
      return res.status(404).json({ result: false, error: "Step introuvable" });

    step.uri = imageUrl;
    const updatedProject = await project.save();

    return res
      .status(200)
      .json({ result: true, step, project: updatedProject });
  } catch (error) {
    console.error("Erreur lors de l'upload de l'image de step:", error);
    return res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

// POST /profil/:token - Upload d'une photo de profil
router.post("/profil/:token", async (req, res) => {
  try {
    const file = req.files?.file;
    const { token } = req.params;
    if (!file)
      return res
        .status(400)
        .json({ result: false, error: "Aucun fichier fourni" });

    const name = file.name;
    const params = {
      Bucket: process.env.R2_BUCKET_DOCUMENTS,
      Key: name,
      Body: file.data,
      ContentType: file.mimetype,
    };

    await r2.upload(params).promise();
    const imageUrl = `${process.env.R2_PUBLIC_URL}/${name}`;

    const constructor = await Constructor.findOneAndUpdate(
      { token },
      { profilePicture: imageUrl },
      { new: true }
    );

    if (constructor) {
      return res
        .status(200)
        .json({
          result: true,
          message: "Photo de profil mise à jour pour le constructeur",
          profilePicture: imageUrl,
          constructor,
        });
    }

    const client = await Client.findOneAndUpdate(
      { token },
      { profilePicture: imageUrl },
      { new: true }
    );

    if (client) {
      return res
        .status(200)
        .json({
          result: true,
          message: "Photo de profil mise à jour pour le client",
          profilePicture: imageUrl,
          client,
        });
    }

    return res
      .status(404)
      .json({ result: false, error: "Utilisateur introuvable avec ce token" });
  } catch (error) {
    console.error("Erreur lors de l'upload du profil:", error);
    return res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

// POST /logo/:phoneNumber - Upload d’un logo artisan
router.post("/logo/:phoneNumber", async (req, res) => {
  try {
    const file = req.files?.file;
    const { phoneNumber } = req.params;
    if (!file)
      return res
        .status(400)
        .json({ result: false, error: "Aucun fichier fourni" });

    const name = file.name;
    const params = {
      Bucket: process.env.R2_BUCKET_DOCUMENTS,
      Key: name,
      Body: file.data,
      ContentType: file.mimetype,
    };

    await r2.upload(params).promise();
    const imageUrl = `${process.env.R2_PUBLIC_URL}/${name}`;

    const craftsman = await Craftsman.findOne({ phoneNumber });
    if (!craftsman)
      return res
        .status(404)
        .json({ result: false, error: "Craftsman introuvable" });

    craftsman.craftsmanLogo = imageUrl;
    const updatedCraftsman = await craftsman.save();

    return res.status(200).json({ result: true, craftsman: updatedCraftsman });
  } catch (error) {
    console.error("Erreur lors de l'upload du logo artisan:", error);
    return res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

module.exports = router;
