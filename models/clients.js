const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  profilePicture: String,
  constructionAdress: String,
  constructionZipCode: String,
  constructionCity: String,
  constructionLat: String,
  constructionLong: String,
  phoneNumber: String,
  token: {
    type: String,
    unique: true,
  },
  role: String,
});

const Client = mongoose.model("clients", clientSchema);

module.exports = Client;
