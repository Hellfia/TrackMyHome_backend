const mongoose = require("mongoose");

const constructeurSchema = new mongoose.Schema({
  constructorName: String,
  email: String,
  password: String,
  profilePicture: String,
  constructorSiret: String,
  token: String,
  role: String,
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "clients" }],
  craftsmen: [{ type: mongoose.Schema.Types.ObjectId, ref: "craftsmen" }],
});

const Constructor = mongoose.model("constructors", constructeurSchema);

module.exports = Constructor;
