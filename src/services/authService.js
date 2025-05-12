const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../config/logger");

const handleLogin = async (inputUsername) => {
    if (!inputUsername) {
        logger.warn("authService.handleLogin called with no username.");
        const error = new Error("Username is required for login.");
        error.statusCode = 400;
        throw error;
    }

    const normalizedUsername = inputUsername.toLowerCase();

    try {
        let user = await User.findOne({ username: normalizedUsername });

        if (!user) {
            user = new User({ username: normalizedUsername });
            await user.save();
            logger.info("authService: New user created. Normalized: '%s', userId=%s", normalizedUsername, user._id);
        } else {
            logger.info("authService: Existing user found. Normalized: '%s', userId=%s", normalizedUsername, user._id);
        }

        const payload = {
            user: {
                id: user._id
            }
        };

        return new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) {
                        logger.error("authService: JWT sign error for normalized username '%s': %o", normalizedUsername, err);
                        const serviceError = new Error("Server error during token generation in service.");
                        serviceError.statusCode = 500;
                        return reject(serviceError);
                    }
                    resolve({ user, token });
                }
            );
        });
    } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
            logger.warn("authService: E11000 conflict for normalized username '%s'. Attempting to fetch existing.", normalizedUsername);
            const existingUser = await User.findOne({ username: normalizedUsername });
            if (existingUser) {
                logger.info("authService: Successfully fetched existing user (Normalized: '%s', ID: %s) after E11000.", normalizedUsername, existingUser._id);
                // Re-attempt JWT signing for the found user
                const payload = { user: { id: existingUser._id } };
                return new Promise((resolve, reject) => {
                    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (e, t) => {
                        if (e) {
                            logger.error("authService: JWT sign error for normalized username '%s' after E11000 conflict: %o", normalizedUsername, e);
                            const serviceError = new Error("Server error during token generation after conflict in service.");
                            serviceError.statusCode = 500;
                            return reject(serviceError);
                        }
                        logger.info("authService: JWT token generated for userId=%s (Normalized: '%s') after E11000 conflict", existingUser._id, normalizedUsername);
                        resolve({ user: existingUser, token: t });
                    });
                });
            } else {
                logger.error("authService: CRITICAL INCONSISTENCY - E11000 for normalized username '%s', but user not found on retry. Original: %o", normalizedUsername, err);
                const serviceError = new Error("Internal server error: Inconsistent data state after username conflict in service.");
                serviceError.statusCode = 500;
                throw serviceError;
            }
        }
        logger.error("authService: Error during login for normalized username '%s': %o", normalizedUsername, err);
        const serviceError = new Error(err.message || "An unexpected error occurred in authService.");
        serviceError.statusCode = err.statusCode || 500;
        throw serviceError;
    }
};

module.exports = {
    handleLogin
}; 