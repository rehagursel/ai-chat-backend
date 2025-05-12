const Character = require("../models/Character");
const Message = require("../models/Message");
const { getSimulatedAIResponse } = require("../utils/ai");
const logger = require("../config/logger");

const createAndRespondToMessage = async (userId, characterId, messageText) => {

    const character = await Character.findById(characterId);
    if (!character) {
        logger.warn("chatService: Character not found. characterId=%s, userId=%s", characterId, userId);
        const error = new Error("Character not found in service.");
        error.statusCode = 404;
        throw error;
    }

    // Save user message
    const userMessage = new Message({
        userId,
        characterId,
        role: "user",
        text: messageText
    });
    await userMessage.save();
    logger.info("chatService: User message saved. userId=%s, characterId=%s", userId, characterId);

    const aiResponseText = getSimulatedAIResponse(messageText, character.basePrompt);

    // Save AI message
    const aiMessage = new Message({
        userId,
        characterId,
        role: "ai",
        text: aiResponseText
    });
    await aiMessage.save();
    logger.info("chatService: AI message saved. userId=%s, characterId=%s", userId, characterId);

    return { userMessage, aiMessage, aiResponseText };
};

const fetchChatHistory = async (userId, characterId) => {
    const messages = await Message.find({
        userId: userId,
        characterId: characterId
    }).sort({ timestamp: "asc" });

    logger.info("chatService: Chat history retrieved. userId=%s, characterId=%s, count=%d", userId, characterId, messages.length);
    return messages;
};

const prepareStreamAndSaveMessages = async (userId, characterId, messageText) => {

    const character = await Character.findById(characterId);
    if (!character) {
        logger.warn("chatService: Character not found (stream). characterId=%s, userId=%s", characterId, userId);
        const error = new Error("Character not found in service (stream).");
        error.statusCode = 404;
        throw error;
    }

    const userMessage = new Message({
        userId,
        characterId,
        role: "user",
        text: messageText
    });
    await userMessage.save();
    logger.info("chatService: User message saved (stream). userId=%s, characterId=%s", userId, characterId);

    const aiResponseText = getSimulatedAIResponse(messageText, character.basePrompt);

    return { userMessage, aiResponseText, characterName: character.name };
};

const saveAIMessagePostStream = async (userId, characterId, aiResponseText) => {
    const aiMessage = new Message({
        userId,
        characterId,
        role: "ai",
        text: aiResponseText
    });
    await aiMessage.save();
    logger.info("chatService: AI message saved (post-stream). userId=%s, characterId=%s", userId, characterId);
    return aiMessage;
};

module.exports = {
    createAndRespondToMessage,
    fetchChatHistory,
    prepareStreamAndSaveMessages,
    saveAIMessagePostStream
}; 