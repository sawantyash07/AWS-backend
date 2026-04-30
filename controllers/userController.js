const User = require("../models/User");
const Repo = require("../models/Repo");

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .populate("repositories")
      .populate("followedRepositories")
      .populate("starRepos")
      .populate("followers", "username email")
      .populate("following", "username email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { username, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.user;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const followUser = async (req, res) => {
  try {
    const { username } = req.params;
    const userToFollow = await User.findOne({ username });
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return res.status(404).json({ message: "User not found" });
    if (userToFollow.id === req.user.id) return res.status(400).json({ message: "Cannot follow yourself" });

    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
      await currentUser.save();
      await userToFollow.save();
    }
    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { username } = req.params;
    const userToUnfollow = await User.findOne({ username });
    const currentUser = await User.findById(req.user.id);

    currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());

    await currentUser.save();
    await userToUnfollow.save();
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUserProfile,
  followUser,
  unfollowUser,
};
