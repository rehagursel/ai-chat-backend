# AI Chat Backend

This project is a backend service for an AI-powered chat application, allowing users to interact with AI characters. It's built with Node.js, Express, and MongoDB.

## Technologies Used

*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (with Mongoose)
*   **Real-time Messaging:** Server-Sent Events (SSE) for streaming
*   **Input Validation:** `express-validator`
*   **Logging:** `winston`

## Setup and Running

### Prerequisites

*   Node.js (v16.x or later recommended)
*   npm
*   MongoDB (a local instance or a cloud-hosted one like MongoDB Atlas)

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/rehagursel/ai-chat-backend.git
    cd ai-chat-backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

### Configuration

1.  Create a `.env` file in the root directory of the project.
2.  Populate it with the necessary environment variables. You can use the following structure:

    ```env

    # Port the server will run on
    PORT=3000

    # MongoDB Connection URI
    # Example local: mongodb://localhost:27017/ai_chat_db
    # Example Atlas: mongodb+srv://<username>:<password>@<cluster-address>/<database_name>?retryWrites=true&w=majority
    MONGO_URI=your_mongodb_connection_string

    # JWT Secret Key
    JWT_SECRET=YOUR_JWT_SECRET_KEY

### Running the Application

*   **Development Mode (with `nodemon` for auto-restarts):**
    ```bash
    npm run dev
    ```

Upon successful startup, you should see console messages like `MongoDB Connected: <host_address>` and `Server running on port <PORT_NUMBER>`.


## Postman Collection

You can import and use the following Postman collection to easily test the API endpoints:

**Collection Link:** [AI Chat Backend Postman Collection](https://www.postman.com/maintenance-astronaut-73041340/chat-app-collection/collection/jxr94jt/ai-chat-backend?action=share&creator=38549351)

**Environments:** 
baseURL: https://ai-chat-backend-git-main-rehagursels-projects.vercel.app
characterId: 68209ce7ff59fa7eb58871bc

Make sure to set up any required environment variables in Postman (like `baseURL` if your local server runs on a different port, or `JWT_TOKEN` after logging in).


## Testing Guide

1.  **API Testing Tools (e.g., Postman):**
    *   Send requests to the API endpoints listed above to verify their functionality.
    *   **Login:** First, hit `POST /api/auth/login` with a `username` to obtain a `token` and `userId`.
    *   **Chat Endpoints:** Use the obtained `token` in the `Authorization` header (format: `Bearer <token>`) for all protected chat endpoints.
    *   Ensure you use valid `characterId` values.
    *   For the SSE endpoint (`/api/chat/stream`), ensure your testing tool supports SSE.

2.  **Manual Test Scenarios:**
    *   Attempt login with a new username; a new user should be created, and a token returned.
    *   Attempt login with an existing username; the existing user should be found, and a token returned.
    *   Test login with different case variations of the same username (e.g., "UserTest", "usertest"); it should resolve to the same user.
    *   Send a message to a character and verify the response structure.
    *   Retrieve chat history and confirm messages are correct and in order.
    *   Test the streaming endpoint.

## Deployed Test UI

You can use the following UI, deployed on Vercel, to test this backend:

**URL:** [https://ai-chat-ui-eight.vercel.app/](https://ai-chat-ui-eight.vercel.app/)

This interface allows you to interact with the backend APIs to test chat functionalities.

## API Endpoints

### Auth

*   **`POST /api/auth/login`**
    *   Description: Logs in a user. If the username doesn't exist, a new user is created. Username is case-insensitive (normalized to lowercase).
    *   Request Body: `{ "username": "testUser" }`
    *   Success Response (`200 OK`):
        ```json
        {
          "success": true,
          "data": {
            "token": "JWT_TOKEN_STRING",
            "userId": "USER_MONGO_ID"
          }
        }
        ```

### Chat

*   **`POST /api/chat`** (Protected)
    *   Description: Sends a message from an authenticated user to an AI character and receives a simulated AI response.
    *   Headers: `Authorization: Bearer <JWT_TOKEN>`
    *   Request Body: `{ "characterId": "CHARACTER_MONGO_ID", "message": "Hello there!" }`
    *   Success Response (`200 OK`):
        ```json
        {
          "success": true,
          "data": {
            "response": "",
            "userMessage": {},
            "aiMessage": {}
          }
        }
        ```

*   **`GET /api/chat/history/:characterId`** (Protected)
    *   Description: Retrieves the chat history for the authenticated user with a specific AI character. Messages are sorted by timestamp in ascending order.
    *   Headers: `Authorization: Bearer <JWT_TOKEN>`
    *   URL Parameter: `:characterId` (MongoDB ID of the character)
    *   Success Response (`200 OK`):
        ```json
        {
          "success": true,
          "data": []
        }
        ```

*   **`POST /api/chat/stream`** (Protected)
    *   Description: Sends a message to an AI character and streams the AI's response word by word using Server-Sent Events (SSE).
    *   Headers: `Authorization: Bearer <JWT_TOKEN>`
    *   Request Body: `{ "characterId": "CHARACTER_MONGO_ID", "message": "" }`
    *   Response: SSE stream with `Content-Type: text/event-stream`. Each word is sent as `data: word\n\n`. The stream ends with `data: [END]\n\n`.

--- 