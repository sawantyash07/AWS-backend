const mongoose = require("mongoose");

const RepoSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
  issues: [{ type: mongoose.Schema.Types.ObjectId, ref: "Issue" }],
  tags: [{ type: String }],
  stars: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  forks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repo" }],
  watchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Repo", RepoSchema);
