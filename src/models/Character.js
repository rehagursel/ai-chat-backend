const mongoose = require("mongoose");

const CharacterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    basePrompt: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Character", CharacterSchema); 