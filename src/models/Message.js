const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    characterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Character",
        required: true
    },
    role: {
        type: String,
        enum: ["user", "ai"],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

MessageSchema.index({ userId: 1, characterId: 1, timestamp: 1 });

module.exports = mongoose.model("Message", MessageSchema); 