const mongoose = require("mongoose");

const craftsmanSchema = new mongoose.Schema({
  craftsmanName: String,
  craftsmanLogo: String,
  craftsmanAdress: String,
  craftsmanZip: String,
  craftsmanCity: String,
  phoneNumber: Number,
});

const Craftsman = mongoose.model("craftsmen", craftsmanSchema);

module.exports = Craftsman;
