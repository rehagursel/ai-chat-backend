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
    let isConnectionClosed = false;

    req.on('close', () => {
        logger.info(`SSE connection closed by client for user: ${userId}, characterId: ${characterId}`);
        isConnectionClosed = true;
    });

    try {
        if (!isConnectionClosed && !res.writableEnded) {
             res.set({
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            });
            res.flushHeaders();
             logger.info(`SSE connection opened for user: ${userId}, characterId: ${characterId}`);
        } else {
             logger.warn(`SSE stream aborted before headers sent or already ended for user: ${userId}`);
             return;
        }

        const { aiResponseText } = await chatService.prepareStreamAndSaveMessages(userId, characterId, message);

        // Stream the response
        const words = aiResponseText.split(" ");
        for (let i = 0; i < words.length; i++) {
            if (isConnectionClosed || res.writableEnded) {
                logger.warn(`SSE stream interrupted for user: ${userId} because connection closed or ended.`);
                break;
            }
            res.write(`data: ${words[i]} \n\n`);
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        if (!isConnectionClosed && !res.writableEnded) {
            try {
                 await chatService.saveAIMessagePostStream(userId, characterId, aiResponseText);

                res.write("data: [END]\n\n");

            } catch(dbError){
                 logger.error("Error saving AI message post-stream: %o", dbError);
            } finally {
                 if (!isConnectionClosed && !res.writableEnded) {
                      logger.info(`Ending SSE stream successfully for user: ${userId}`);
                      res.end();
                 }
            }
        } else if (!res.writableEnded) {
             logger.info(`Ending SSE stream because connection closed during loop for user: ${userId}`);
             res.end();
        }

    } catch (err) {
        logger.error("chatController.streamChatMessage main error catch: userId=%s, characterId=%s, error: %o", userId, characterId, err);
        if (!isConnectionClosed && !res.headersSent && !res.writableEnded) {
             logger.warn(`Passing error to global handler as SSE stream did not start for user: ${userId}`);
            next(err);
        } else if (!isConnectionClosed && !res.writableEnded) {
            logger.error("chatController: Ending SSE stream due to error after headers sent or during processing.");
            res.end();
        }
    }
};

module.exports = {
    postChatMessage,
    getChatHistory,
    streamChatMessage
}; 