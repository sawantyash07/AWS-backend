const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");
const auth = require("../middleware/auth");

router.post("/create", auth, issueController.createIssue);
router.get("/repo/:repoName", issueController.getRepoIssues);
router.get("/:id", issueController.getIssueDetails);
router.put("/:id", auth, issueController.updateIssue);
router.delete("/:id", auth, issueController.deleteIssue);
router.post("/:id/comment", auth, issueController.addComment);

module.exports = router;
