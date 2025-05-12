const authService = require("../services/authService");
const logger = require("../config/logger");

const loginUser = async (req, res, next) => {
    const { username } = req.body;

    try {
        logger.info("authController: Login attempt for username: '%s'", username);
        
        const { user, token } = await authService.handleLogin(username);

        logger.info("authController: Login successful, token generated for userId=%s (Input username: '%s')", user._id, username);
        res.status(200).json({
            success: true,
            data: {
                token,
                userId: user._id
            }
        });
    } catch (err) {
        logger.error("authController: Error in loginUser for username '%s': %o", username, err);
        next(err); 
    }
};

module.exports = {
    loginUser
}; 