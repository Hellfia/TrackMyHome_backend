const express = require("express");
const router = express.Router();
const r2 = require("../modules/r2config");
const Project = require("../models/projects");
require("../models/connection");

router.post("/:projectId", (req, res) => {
  const file = req.files.file;
  const name = file.name;
  const params = {
    Bucket: process.env.R2_BUCKET_DOCUMENTS,
    Key: name,
    Body: file.data,
    ContentType: file.mimetype,
  };
  r2.upload(params)
    .promise()
    .then(() => {
      const imageUrl = `${process.env.R2_PUBLIC_URL}/${name}`;

      Project.findByIdAndUpdate(
        req.params.projectId,
        {
          $push: {
            documents: { uri: imageUrl, date: Date.now(), name: file.name },
          },
        },
        { new: true }
      ).then((updatedDocument) => {
        res.json({
          result: true,
          documents: updatedDocument.documents,
          project: updatedDocument,
        });
      });
    });
});

router.get("/documents/:projectId", (req, res) => {
  const { projectId } = req.params;

  Project.findById(projectId)
    .then((project) => {
      if (!project) {
        return res
          .status(404)
          .json({ result: false, message: "Projet introuvable." });
      }
      res.json({
        result: true,
        documents: project.documents,
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ result: false, message: "Erreur serveur.", error });
    });
});

router.delete("/documents/:projectId/:documentId", (req, res) => {
  const { projectId, documentId } = req.params;

  Project.findById(projectId)
    .then((project) => {
      if (!project) {
        return res
          .status(404)
          .json({ result: false, message: "Projet introuvable." });
      }

      // Filtrer pour exclure le document à supprimer
      const updatedDocuments = project.documents.filter(
        (doc) => doc._id.toString() !== documentId
      );

      if (updatedDocuments.length === project.documents.length) {
        return res
          .status(404)
          .json({ result: false, message: "Document introuvable." });
      }

      // Mettre à jour le projet avec les documents restants
      project.documents = updatedDocuments;

      project.save().then((updatedProject) => {
        res.json({
          result: true,
          message: "Document supprimé avec succès.",
          documents: updatedProject.documents,
        });
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ result: false, message: "Erreur serveur.", error });
    });
});

router.post("/picture/:clientIdProps/:stepId", (req, res) => {
  const file = req.files.file;
  const { stepId } = req.params;

  if (!file) {
    res.status(400).json({ result: false, error: "Aucun fichier fourni" });
    return;
  }

  const name = file.name;
  const params = {
    Bucket: process.env.R2_BUCKET_DOCUMENTS,
    Key: name,
    Body: file.data,
    ContentType: file.mimetype,
  };

  // Envoi à Cloudflare
  r2.upload(params)
    .promise()
    .then(() => {
      const imageUrl = `${process.env.R2_PUBLIC_URL}/${name}`;

      // Recherche du cl et mise à jour de la step ciblée
      Project.findOne({ client: req.params.clientIdProps })
        .then((project) => {
          if (!project) {
            res
              .status(404)
              .json({ result: false, error: "Projet introuvable" });
            return;
          }

          // Recherche de la step par ID
          const step = project.steps.find(
            (step) => step._id.toString() === stepId
          );

          if (!step) {
            res.status(404).json({ result: false, error: "Step introuvable" });
            return;
          }

          // Mise à jour de l'URI dans la step
          step.uri = imageUrl;

          // Sauvegarde du projet avec la mise à jour
          project
            .save()
            .then((updatedProject) => {
              res.json({
                result: true,
                step: step,
                project: updatedProject,
              });
            })
            .catch((error) => {
              console.error("Erreur lors de la sauvegarde du projet :", error);
              res.status(500).json({
                result: false,
                error: "Erreur lors de la mise à jour de la step",
              });
            });
        })
        .catch((error) => {
          console.error("Erreur lors de la recherche du projet :", error);
          res.status(500).json({
            result: false,
            error: "Erreur lors de la récupération du projet",
          });
        });
    })
    .catch((error) => {
      console.error("Erreur lors de l'upload vers Cloudflare :", error);
      res.status(500).json({
        result: false,
        error: "Erreur lors de l'upload du fichier",
      });
    });
});

module.exports = router;
