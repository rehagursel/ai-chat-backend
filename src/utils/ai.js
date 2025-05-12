function getSimulatedAIResponse(message) {
    const lower = message.toLowerCase();
    if (lower.includes("hello")) return "Hello! How can I assist you today?";
    if (lower.includes("how are you")) return "I'm an AI, so I don't have feelings, but I'm here to help you!";
    return "Let me help you with your question. This is a simulated streaming response from the AI model.";
  }
  
  module.exports = { getSimulatedAIResponse };