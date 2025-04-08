const express = require("express");
const router = express.Router();
const Project = require("../models/projects");

router.post("/:projectId", (req, res) => {
  const { projectId } = req.params;
  const { sender, content } = req.body;

  if (!sender || !content) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  Project.findByIdAndUpdate(projectId, {
    $push: {
      messages: {
        sender,
        content,
      },
    },
  })
    .then(() => {
      res.json({ success: true, message: "Message ajouté au projet" });
    })
    .catch((err) => {
      console.error("Erreur ajout message :", err);
      res.status(500).json({ error: "Erreur serveur" });
    });
});

router.get("/:projectId", (req, res) => {
  const { projectId } = req.params;

  Project.findById(projectId)
    .select("messages")
    .then((project) => {
      if (!project) {
        return res.status(404).json({ error: "Projet non trouvé" });
      }

      res.json({ success: true, messages: project.messages });
    })
    .catch((err) => {
      console.error("Erreur récupération des messages :", err);
      res.status(500).json({ error: "Erreur serveur" });
    });
});

module.exports = router;
