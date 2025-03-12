const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  name: String,
  date: Date,
  uri: String,
});

const commentSchema = new mongoose.Schema({
  date: Date,
  content: String,
});

const stepSchema = new mongoose.Schema({
  name: String,
  date: Date,
  dateEnd: Date,
  status: String,
  uri: String,
  content: String,
});

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
  comments: [commentSchema],
});

const Project = mongoose.model("projects", projectSchema);

module.exports = Project;
