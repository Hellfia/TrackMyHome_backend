const mongoose = require("mongoose");

const constructorSchema = new mongoose.Schema({
  constructorName: String,
  email: String,
  password: String,
  profilePicture: String,
  constructorAdress: String,
  constructorZip: String,
  constructorCity: String,
  constructorSiret: Number,
  token: String,
  role: String,
});

const Constructor = mongoose.model("constructors", constructorSchema);

module.exports = Constructor;
