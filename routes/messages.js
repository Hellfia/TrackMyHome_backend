const express = require("express");
const router = express.Router();
const Project = require("../models/projects");

// POST - Ajouter un message à un projet
router.post("/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const { sender, content } = req.body;

  if (!sender || !content) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $push: {
          messages: {
            sender,
            content,
            timestamp: new Date(), // tu peux aussi stocker la date
          },
        },
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    return res.status(200).json({
      success: true,
      message: "Message ajouté au projet",
      messages: updatedProject.messages,
    });
  } catch (err) {
    console.error("Erreur ajout message :", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET - Récupérer les messages d’un projet
router.get("/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId).select("messages");

    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    return res.status(200).json({ success: true, messages: project.messages });
  } catch (err) {
    console.error("Erreur récupération des messages :", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
