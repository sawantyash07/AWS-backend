const mongoose = require("mongoose");

const CommitSchema = new mongoose.Schema({
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true },
  message: { type: String, required: true },
  files: [
    {
      path: { type: String, required: true },
      content: { type: String, required: true },
      s3Url: { type: String },
    },
  ],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Commit", CommitSchema);
