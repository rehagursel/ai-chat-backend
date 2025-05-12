const express = require("express");
const { body } = require("express-validator");
const { loginUser } = require("../controllers/authController");
const validate = require("../middleware/validate");
const router = express.Router();

// @route   POST api/auth/login
// @desc    Authenticate user
// @access  Public
router.post(
  "/login",
  [
    body("username")
      .isString()
      .notEmpty()
      .withMessage("username is required")
  ],
  validate,
  loginUser
);

module.exports = router; 