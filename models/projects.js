const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  date: Date,
  uri: String, // uri de cloudinary
});

const commentSchema = new mongoose.Schema({
  date: Date,
  content: String,
});

const messageSchema = new mongoose.Schema({
  timeStamps: Date,
  content: String,
});

const conversationSchema = new mongoose.Schema({
  messages: [messageSchema],
});

const stepSchema = new mongoose.Schema({
  name: String,
  date: Date,
  dateEnd: Date,
  status: String,
  uri: String, // uri de cloudinary
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
  conversation: conversationSchema,
  steps: [stepSchema],
  documents: [documentSchema],
  comments: [commentSchema],
});

const Project = mongoose.model("projects", projectSchema);

module.exports = Project;
