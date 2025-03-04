const express = require("express");
const router = express.Router();

// const Pusher = require("pusher");

// const pusher = new Pusher({
//   appId: process.env.PUSHER_APPID,
//   key: process.env.PUSHER_KEY,
//   secret: process.env.PUSHER_SECRET,
//   cluster: process.env.PUSHER_CLUSTER,
//   useTLS: true,
// });

// // Join chat pour un client
// router.put("/client/:firstname", (req, res) => {
//   pusher.trigger("chat", "join", {
//     firstname: req.params.firstname,
//   });

//   res.json({ result: true });
// });

// // Join chat pour un constructeur
// router.put("/constructeur/:constructeurName", (req, res) => {
//   pusher.trigger("chat", "join", {
//     constructeurName: req.params.constructeurName,
//   });

//   res.json({ result: true });
// });

// // Envoyer un message
// router.post("/message", (req, res) => {
//   // Récupère les données du message depuis le corps de la requête
//   const { constructeurName, firstName, content, channel } = req.body;

//   // Envoie le message via Pusher
//   pusher.trigger(channel, "message", {
//     constructeurName: constructeurName,
//     firstName: firstName,
//     text: content,
//     timestamp: new Date(),
//   });

//   // Répond à la requête avec un succès
//   res.json({ result: true });
// });

module.exports = router;
