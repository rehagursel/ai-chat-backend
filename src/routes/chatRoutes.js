const express = require("express");
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");
const router = express.Router();
const { postChatMessage, getChatHistory, streamChatMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST api/chat
// @desc    Send a message to a character
// @access  Private
router.post(
  "/",
  protect,
  [
    body("characterId").notEmpty().withMessage("characterId is required"),
    body("message").isString().notEmpty().withMessage("message is required")
  ],
  validate,
  postChatMessage
);

// @route   GET api/chat/history/:characterId
// @desc    Get chat history for a user with a character
// @access  Private
router.get(
  "/history/:characterId",
  protect,
  [
    param("characterId").notEmpty().withMessage("characterId is required")
  ],
  validate,
  getChatHistory
);

// @route   POST api/chat/stream
// @desc    Stream chat messages
// @access  Private
router.post(
  "/stream",
  protect,
  [
    body("characterId").notEmpty().withMessage("characterId is required"),
    body("message").isString().notEmpty().withMessage("message is required")
  ],
  validate,
  streamChatMessage
);

module.exports = router; 