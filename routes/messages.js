const express = require("express");
const router = express.Router();

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Join chat pour un client
router.put("/client/:firstname", (req, res) => {
  pusher.trigger("chat", "join", {
    firstname: req.params.firstname,
  });

  res.json({ result: true });
});

// Join chat pour un constructeur
router.put("/constructor/:constructorName", (req, res) => {
  pusher.trigger("chat", "join", {
    constructorName: req.params.constructorName,
  });

  res.json({ result: true });
});

// Envoyer un message
router.post("/message", (req, res) => {
  // Récupère les données du message depuis le corps de la requête
  const { constructorName, firstName, content, channel } = req.body;

  // Vérifie que toutes les informations nécessaires sont présentes
  if (!firstName || !content || !channel) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  // Envoie le message via Pusher
  pusher.trigger(channel, "message", {
    constructorName: constructorName,
    firstName: firstName,
    text: content,
    timestamp: new Date(),
  });

  // Répond à la requête avec un succès
  res.json({ result: true });
});

module.exports = router;
