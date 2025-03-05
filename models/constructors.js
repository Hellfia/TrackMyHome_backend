const mongoose = require("mongoose");

const constructeurSchema = new mongoose.Schema({
  constructorName: String,
  email: String,
  password: String,
  profilePicture: String,
  constructorSiret: Number,
  token: String,
  role: String,
  craftsmen: [{ type: mongoose.Schema.Types.ObjectId, ref: "craftsmen" }],
});

const Constructor = mongoose.model("constructors", constructeurSchema);

module.exports = Constructor;
