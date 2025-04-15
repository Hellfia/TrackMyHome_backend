const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  name: String,
  date: Date,
  uri: String,
});

const stepSchema = new mongoose.Schema({
  name: String,
  date: Date,
  dateEnd: Date,
  status: String,
  uri: String,
  content: String,
});

const messageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  date: {
    type: Date,
    default: Date.now,
  },
});
//bonjour

const projectSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "clients",
  },
  constructeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "constructors",
  },
  Craftsmen: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "craftsmen",
    },
  ],
  steps: [stepSchema],
  documents: [documentSchema],
  messages: [messageSchema],
});

const Project = mongoose.model("projects", projectSchema);

module.exports = Project;
