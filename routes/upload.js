const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const r2 = require("../modules/r2config");
const Project = require("../models/projects");
require("../models/connection");

router.post("/:projectId", (req, res) => {
  const file = req.files.file;
  const name = file.name + uid2(16);
  const params = {
    Bucket: process.env.R2_BUCKET_DOCUMENTS,
    Key: name,
    Body: file.data,
    ContentType: file.mimetype,
  };
  r2.upload(params)
    .promise()
    .then(() => {
      const imageUrl = `${process.env.R2_PUBLIC_URL}/${file.name}`;

      Project.findByIdAndUpdate(
        req.params.projectId,
        {
          $push: {
            documents: { uri: imageUrl, date: Date.now(), name: file.name },
          },
        },
        { new: true }
      ).then((updatedDocument) => {
        res.json({
          result: true,
          documents: updatedDocument.documents,
          project: updatedDocument,
        });
      });
    });
});

module.exports = router;
