const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const logger = require("./src/config/logger");
const errorHandler = require("./src/middleware/errorHandler");
require("dotenv").config();

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://ai-chat-ui-eight.vercel.app/"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// HTTP request logging
app.use(morgan("dev", { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.get('/', (req, res) => {
    res.status(200).json({ 
      status: 'success', 
      message: 'Welcome to the AI Chat Backend API!',
      documentationNote: 'Please refer to the API documentation for available endpoints.' 
    });
});

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/chat", require("./src/routes/chatRoutes"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.info("Connected to MongoDB"))
    .catch((err) => logger.error("MongoDB connection error: %o", err));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
