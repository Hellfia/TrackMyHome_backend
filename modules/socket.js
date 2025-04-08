// modules/socket.js
const { Server } = require("socket.io");

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Accepte toutes les origines (à sécuriser pour la prod)
    },
  });

  // Lorsqu'un client se connecte
  io.on("connection", (socket) => {
    console.log("Un utilisateur s'est connecté");

    // Lorsque l'utilisateur rejoint un projet (room)
    socket.on("joinProject", (projectId) => {
      socket.join(projectId); // Rejoindre la room spécifique au projet
      console.log(`Utilisateur a rejoint le projet ${projectId}`);
    });

    // Écouter l'événement de message envoyé par l'utilisateur
    socket.on("sendMessage", (data) => {
      console.log("Message reçu :", data);
      // Diffuser le message à tous les autres clients dans la room du projet
      io.to(data.projectId).emit("newMessage", data); // Utiliser 'newMessage' pour l'événement émis
    });

    // Lorsque l'utilisateur se déconnecte
    socket.on("customDisconnect", () => {
      console.log("Utilisateur a demandé une déconnexion explicite");
      // Effectue des actions nécessaires avant de déconnecter
    });
  });

  return io;
};

module.exports = configureSocket;
