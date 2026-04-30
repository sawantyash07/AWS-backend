const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// @route   POST api/auth/signup
// @desc    Register a new user
exports.signup = async (req, res) => {
  console.log("Signup Request Body:", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let { username, email, password } = req.body;
  
  // Trim inputs to avoid whitespace issues
  username = username.trim();
  email = email.trim();
  password = password.trim();

  try {
    // Check if user already exists (case-insensitive)
    let user = await User.findOne({ 
      $or: [
        { email: { $regex: new RegExp(`^${email}$`, "i") } }, 
        { username: { $regex: new RegExp(`^${username}$`, "i") } }
      ] 
    });

    if (user) {
      console.log("Signup failed: User already exists.");
      return res.status(400).json({ message: "User already exists" });
    }

    // Create and save user (hashing happens in User model pre-save hook)
    user = new User({ username, email, password });
    await user.save();
    console.log(`User registered successfully: ${username}`);

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || "vcs_secret_key", { expiresIn: "24h" }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token, user: { id: user.id, username, email } });
    });

  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).send("Server error");
  }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
exports.login = async (req, res) => {
  console.log("Login Request Body:", req.body);
  let { email, password } = req.body; // 'email' field can be username or email

  if (!email || !password) {
    return res.status(400).json({ message: "Identifier and password required" });
  }

  email = email.trim();
  password = password.trim();

  try {
    // Find user by email or username (case-insensitive)
    let user = await User.findOne({ 
      $or: [
        { email: { $regex: new RegExp(`^${email}$`, "i") } }, 
        { username: { $regex: new RegExp(`^${email}$`, "i") } }
      ] 
    });

    if (!user) {
      console.log(`Login failed: No user found for '${email}'`);
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Compare password using model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Login failed: Password mismatch.");
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    console.log("Login successful! Issuing token...");
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || "vcs_secret_key", { expiresIn: "24h" }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server error");
  }
};

// @route   GET api/auth/me
// @desc    Get current user data
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).send("Server error");
  }
};
