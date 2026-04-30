const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

router.get("/:username", userController.getUserProfile);
router.put("/profile", authMiddleware, userController.updateUserProfile);
router.delete("/profile", authMiddleware, userController.deleteUserProfile);
router.get("/", userController.getAllUsers);

// Follow/Unfollow routes
router.post("/follow/:username", authMiddleware, userController.followUser);
router.post("/unfollow/:username", authMiddleware, userController.unfollowUser);

module.exports = router;
