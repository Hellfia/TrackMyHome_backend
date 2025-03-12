const express = require("express");
const router = express.Router();
require("../models/connection");

router.post("/upload", (req, res) => {
  if (!req.body.file) {
    return res.status(400).json({ result: false, error: "No file uploaded" });
  }
  if (!req.body.projectId) {
    console.log("req.body.if", req.body);
    return res
      .status(400)
      .json({ result: false, error: "Project ID is required" });
  }

  const projectId = req.body.projectId;
  const document = req.body.file;

  Project.findByIdAndUpdate(
    projectId,
    { $push: { documents: document } },
    { new: true }
  )
    .then((updatedProject) => {
      res.json({
        result: true,
        documents: updatedProject.documents,
        project: updatedProject,
      });
    })
    .catch((updateError) => {
      console.error("Error updating project:", updateError);
      res
        .status(500)
        .json({ result: false, error: "Failed to update project" });
    });
});

module.exports = router;
