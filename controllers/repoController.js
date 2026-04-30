const Repo = require("../models/Repo");
const User = require("../models/User");
const Commit = require("../models/Commit");
const s3Service = require("../services/s3Service");
const { incrementContribution } = require("../utils/contributionHelper");

exports.initRepo = async (req, res) => {
  try {
    const { name, description } = req.body;
    const owner = req.user.id; // From auth middleware

    let repo = await Repo.findOne({ name });
    if (repo) {
      return res.status(400).json({ message: "Repository already exists" });
    }

    repo = new Repo({ name, description, owner });
    await repo.save();
    
    // Record contribution
    await incrementContribution(owner);

    res.status(201).json({ message: "Repository initialized successfully", repo });
  } catch (error) {
    res.status(500).json({ message: "Error initializing repository", error: error.message });
  }
};

exports.commitChanges = async (req, res) => {
  try {
    const { repoName, message, files } = req.body;
    const repo = await Repo.findOne({ name: repoName });
    
    if (!repo) return res.status(404).json({ message: "Repository not found" });
    
    // Check ownership
    if (repo.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized to push to this repository" });
    }

    const processedFiles = [];
    const hasAwsKeys = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== "your_access_key";

    for (const file of files) {
      let s3Url = null;
      if (hasAwsKeys) {
        try {
          s3Url = await s3Service.uploadFile(file.path, file.content);
        } catch (err) {
          console.error(`Failed to upload ${file.path} to S3:`, err.message);
        }
      }
      processedFiles.push({
        path: file.path,
        content: file.content,
        s3Url,
      });
    }

    const commit = new Commit({
      repoId: repo._id,
      message,
      files: processedFiles,
    });

    await commit.save();

    // Record contribution
    await incrementContribution(req.user.id);

    // Emit socket event
    const io = req.app.get("io");
    io.to(repo._id.toString()).emit("commit", {
      message: "New commit pushed",
      commit,
    });

    const s3Count = processedFiles.filter(f => f.s3Url).length;
    res.status(201).json({ 
      message: "Commit created successfully", 
      commit,
      s3Status: s3Count === files.length ? "All synced to S3" : `${s3Count}/${files.length} files synced to S3.`
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating commit", error: error.message });
  }
};

exports.getCommits = async (req, res) => {
  try {
    const { repoName } = req.params;
    const repo = await Repo.findOne({ name: repoName });
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    // Check visibility/ownership (simplified: owners can always see, others can see public)
    if (repo.visibility === "private" && repo.owner.toString() !== req.user?.id) {
        return res.status(403).json({ message: "Access denied to private repository" });
    }

    const commits = await Commit.find({ repoId: repo._id }).sort({ timestamp: -1 });
    res.json(commits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching commits", error: error.message });
  }
};

exports.getAllRepos = async (req, res) => {
  try {
    // Return public repos or repos owned by user
    const repos = await Repo.find({
        $or: [
            { visibility: "public" },
            { owner: req.user?.id }
        ]
    }).populate("owner", "username");
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching repositories", error: error.message });
  }
};

exports.updateRepo = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, visibility } = req.body;
    const repo = await Repo.findById(id);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    if (repo.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    repo.description = description || repo.description;
    repo.visibility = visibility || repo.visibility;
    await repo.save();

    res.json({ message: "Repository updated", repo });
  } catch (error) {
    res.status(500).json({ message: "Error updating repository", error: error.message });
  }
};

exports.deleteRepo = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = await Repo.findById(id);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    if (repo.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Repo.findByIdAndDelete(id);
    res.json({ message: "Repository deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting repository", error: error.message });
  }
};

exports.toggleStar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const repo = await Repo.findById(id);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    const user = await User.findById(userId);

    if (repo.stars.includes(userId)) {
      repo.stars = repo.stars.filter((s) => s.toString() !== userId);
      user.starRepos = user.starRepos.filter((s) => s.toString() !== id);
    } else {
      repo.stars.push(userId);
      user.starRepos.push(id);
    }

    await repo.save();
    await user.save();
    res.json({ message: "Star toggled", stars: repo.stars.length });
  } catch (error) {
    res.status(500).json({ message: "Error toggling star", error: error.message });
  }
};

exports.getRepoDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = await Repo.findById(id)
      .populate("owner", "username")
      .populate("issues");
    if (!repo) return res.status(404).json({ message: "Repository not found" });
    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: "Error fetching repository details", error: error.message });
  }
};


