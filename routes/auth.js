const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const { check } = require("express-validator");

router.post(
  "/signup",
  [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

router.get("/me", auth, authController.getMe);

module.exports = router;
