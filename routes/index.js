const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Constructor = require("../models/constructors");
const Client = require("../models/clients");
const Project = require("../models/projects");
const bcrypt = require("bcrypt");

router.post("/signin", async (req, res) => {
  try {
    if (!checkBody(req.body, ["email", "password"])) {
      return res
        .status(400)
        .json({ result: false, error: "Missing or empty fields" });
    }

    const { email, password } = req.body;

    // Vérifier si c'est un client
    const client = await Client.findOne({ email });

    if (client && (await bcrypt.compare(password, client.password))) {
      const project = await Project.findOne({ client: client._id });

      return res.status(200).json({
        result: true,
        role: "client",
        clientId: client._id,
        token: client.token,
        projectId: project ? project._id : null,
        firstname: client.firstname,
        lastname: client.lastname,
        profilPicture: client.profilePicture,
      });
    }

    // Sinon, vérifier si c'est un constructeur
    const constructor = await Constructor.findOne({ email });

    if (constructor && (await bcrypt.compare(password, constructor.password))) {
      return res.status(200).json({
        result: true,
        role: "constructeur",
        constructorId: constructor._id,
        token: constructor.token,
        constructorName: constructor.constructorName,
        profilPicture: constructor.profilePicture,
      });
    }

    // Aucun utilisateur trouvé
    return res
      .status(401)
      .json({ result: false, error: "User not found or wrong password" });
  } catch (err) {
    console.error("Error during signin:", err);
    return res
      .status(500)
      .json({ result: false, error: "Internal server error" });
  }
});

module.exports = router;
