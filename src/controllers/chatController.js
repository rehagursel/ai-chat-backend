const chatService = require("../services/chatService");
const logger = require("../config/logger");

const postChatMessage = async (req, res, next) => {
    const { characterId, message } = req.body;
    const userId = req.user.id;

    try {
        const { userMessage, aiMessage, aiResponseText } = await chatService.createAndRespondToMessage(userId, characterId, message);

        res.status(200).json({
            success: true,
            data: {
                response: aiResponseText,
                userMessage: userMessage,
                aiMessage: aiMessage
            }
        });
    } catch (err) {
        logger.error("chatController.postChatMessage error: userId=%s, characterId=%s, error: %o", userId, characterId, err);
        next(err);
    }
};

const getChatHistory = async (req, res, next) => {
    const { characterId } = req.params;
    const loggedInUserId = req.user.id;

    try {
        const messages = await chatService.fetchChatHistory(loggedInUserId, characterId);

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (err) {
        logger.error("chatController.getChatHistory error: userId=%s, characterId=%s, error: %o", loggedInUserId, characterId, err);
        next(err);
    }
};

const streamChatMessage = async (req, res, next) => {
    const { characterId, message } = req.body;
    const userId = req.user.id;

    try {
        const { aiResponseText } = await chatService.prepareStreamAndSaveMessages(userId, characterId, message);

        res.set({
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        });
        res.flushHeaders();

        // Stream the response
        const words = aiResponseText.split(" ");
        for (let i = 0; i < words.length; i++) {
            res.write(`data: ${words[i]} \n\n`);
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        // Save AI message to DB
        await chatService.saveAIMessagePostStream(userId, characterId, aiResponseText);

        res.write("data: [END]\n\n");
        res.end();
    } catch (err) {
        logger.error("chatController.streamChatMessage error: userId=%s, characterId=%s, error: %o", userId, characterId, err);
        if (!res.headersSent) {
            next(err);
        } else {
            logger.error("chatController: SSE stream error after headers sent. Client might have partial data or disconnected.");
            res.end();
        }
    }
};

module.exports = {
    postChatMessage,
    getChatHistory,
    streamChatMessage
}; 