const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  profilePicture: String,
  constructionAdresse: String,
  constructionZipCode: String,
  constructionCity: String,
  token: String,
  role: String,
});

const Client = mongoose.model("clients", clientSchema);

module.exports = Client;
// Compare this snippet from TrackMyHomeApp-FrontEnd/screens/ConnexionScreen.js:
