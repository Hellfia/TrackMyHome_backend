const mongoose = require("mongoose");

const craftsmanSchema = new mongoose.Schema({
  craftsmanName: String,
  craftsmanLogo: String,
  craftsmanAddress: String,
  craftsmanZip: String,
  craftsmanCity: String,
  craftsmanLat: String,
  craftsmanLong: String,
  phoneNumber: String,
});

const Craftsman = mongoose.model("craftsmen", craftsmanSchema);

module.exports = Craftsman;
