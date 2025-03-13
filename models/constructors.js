const mongoose = require("mongoose");

const constructeurSchema = new mongoose.Schema({
  constructorName: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: String,
  profilePicture: String,
  constructorSiret: String,
  token: {
    type: String,
    unique: true,
  },
  phoneNumber: String,
  zipCode: String,
  address: String,
  city: String,
  role: String,
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "clients" }],
  craftsmen: [{ type: mongoose.Schema.Types.ObjectId, ref: "craftsmen" }],
});

const Constructor = mongoose.model("constructors", constructeurSchema);

module.exports = Constructor;
