const express = require("express");
const router = express.Router();
const repoController = require("../controllers/repoController");
const auth = require("../middleware/auth");

router.post("/init", auth, repoController.initRepo);
router.post("/commit", auth, repoController.commitChanges);
router.get("/commits/:repoName", repoController.getCommits); 
router.get("/all", repoController.getAllRepos);
router.get("/:id", repoController.getRepoDetails);
router.put("/:id", auth, repoController.updateRepo);
router.delete("/:id", auth, repoController.deleteRepo);
router.post("/:id/star", auth, repoController.toggleStar);

module.exports = router;
