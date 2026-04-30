const Issue = require("../models/Issue");
const Repo = require("../models/Repo");

exports.createIssue = async (req, res) => {
    try {
        const { title, description, repoName } = req.body;
        const repo = await Repo.findOne({ name: repoName });
        if (!repo) return res.status(404).json({ message: "Repo not found" });

        const issue = new Issue({
            title,
            description,
            repoId: repo._id,
            createdBy: req.user.id
        });

        await issue.save();
        repo.issues.push(issue._id);
        await repo.save();

        const io = req.app.get("io");
        io.to(repo._id.toString()).emit("issue", {
            action: "created",
            issue,
        });

        res.status(201).json(issue);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRepoIssues = async (req, res) => {
    try {
        const { repoName } = req.params;
        const repo = await Repo.findOne({ name: repoName }).populate("issues");
        if (!repo) return res.status(404).json({ message: "Repo not found" });
        res.json(repo.issues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getIssueDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findById(id).populate("createdBy", "username").populate("comments.user", "username");
        if (!issue) return res.status(404).json({ message: "Issue not found" });
        res.json(issue);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        const issue = await Issue.findById(id);
        if (!issue) return res.status(404).json({ message: "Issue not found" });

        if (issue.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        issue.title = title || issue.title;
        issue.description = description || issue.description;
        issue.status = status || issue.status;
        await issue.save();

        const io = req.app.get("io");
        io.to(issue.repoId.toString()).emit("issue", {
            action: "updated",
            issue,
        });

        res.json(issue);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findById(id);
        if (!issue) return res.status(404).json({ message: "Issue not found" });

        if (issue.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Issue.findByIdAndDelete(id);
        res.json({ message: "Issue deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const issue = await Issue.findById(id);
        if (!issue) return res.status(404).json({ message: "Issue not found" });

        issue.comments.push({ user: req.user.id, text });
        await issue.save();

        const io = req.app.get("io");
        io.to(issue.repoId.toString()).emit("comment", {
            issueId: issue._id,
            comment: issue.comments[issue.comments.length - 1],
        });

        res.json(issue);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

