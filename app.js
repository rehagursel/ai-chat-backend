const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const logger = require("./src/config/logger");
const errorHandler = require("./src/middleware/errorHandler");
require("dotenv").config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// HTTP request logging
app.use(morgan("dev", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/chat", require("./src/routes/chatRoutes"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.info("Connected to MongoDB"))
    .catch((err) => logger.error("MongoDB connection error: %o", err));

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
