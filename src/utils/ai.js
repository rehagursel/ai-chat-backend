function getSimulatedAIResponse(message, basePrompt) {
    const lowerMsg = message.toLowerCase();
    let responsePrefix = "";

    if (basePrompt && basePrompt.toLowerCase().includes("friendly")) {
        responsePrefix = "As your friendly assistant, I'd say: ";
    } else if (basePrompt && basePrompt.toLowerCase().includes("formal")) {
        responsePrefix = "From a formal perspective: ";
    }

    if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("merhaba")) {
        return responsePrefix + "Hello! How can I assist you today?";
    }
    if (lowerMsg.includes("how are you") || lowerMsg.includes("nasılsın") || lowerMsg.includes("nasılsınız") || lowerMsg.includes("how are you doing")) {
        return responsePrefix + "I'm an AI and functioning as expected. How can I help?";
    }

    return responsePrefix + "Let me simulate a response based on your message and my base instructions. This is a simulated stream.";
}
  
module.exports = { getSimulatedAIResponse };