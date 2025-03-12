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

module.exports = router;
