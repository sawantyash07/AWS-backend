const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  repositories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repo" }],
  followedRepositories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repo" }],
  starRepos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repo" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  contributions: [
    {
      date: { type: String, required: true }, // Format: YYYY-MM-DD
      count: { type: Number, default: 0 },
    },
  ],
});

// Hash password before saving to database
UserSchema.pre("save", async function () {
  // Only hash if the password has been modified (or is new)
  if (!this.isModified("password")) return;

  console.log(`Hashing password for user: ${this.username}`);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare password during login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  console.log(`Comparing candidate password with hashed password for a user...`);
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log(`Password match status: ${isMatch}`);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
