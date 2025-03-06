const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  profilePicture: String,
  constructionAdress: String,
  constructionZipCode: String,
  constructionCity: String,
  constructionLat: String,
  constructionLong: String,
  token: String,
  role: String,
});

const Client = mongoose.model("clients", clientSchema);

module.exports = Client;
