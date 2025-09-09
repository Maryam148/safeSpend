import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageCircle } from "lucide-react"; // Only Chat icon needed now

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      // Initial message from the bot (model)
      role: "model",
      text: "Assalamualaikum! I can help with Islamic finance calculators and Shariah-compliant financial queries. How can I help?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  // Ref to automatically scroll to the latest message
  const messagesEndRef = useRef(null);

  // Your Gemini API Key and Model URL
  // IMPORTANT: For security, in a real application, never expose your API key directly in client-side code.
  // Use a backend proxy to handle API requests.
  const GEMINI_API_KEY = "AIzaSyBduGgaGBgdlzLBnol6kMalqPYNybP29W8"; // Replace with your actual API key
  // Using gemini-1.5-flash for faster responses. Ensure this model is enabled for your API key.
  const GEMINI_CHAT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;


  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]); // Removed isSuggesting from dependencies

  // Main function to send messages to the chatbot
  const sendMessage = async () => {
    if (!userInput.trim()) return; // Prevent sending empty messages

    // Add the user's message to the chat history
    const newUserMessage = { role: "user", text: userInput };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages); // Update state immediately for user to see their message
    setUserInput(""); // Clear the input field
    setLoading(true); // Show loading indicator for main chat

    // Define a system instruction for the model. This guides the AI's behavior.
    const systemInstructionContent = {
      role: "user", // System instructions are typically sent under the 'user' role at the start
      parts: [
        {
          text: `You are an Islamic finance assistant.
          Only answer questions about Islamic financial calculators, Shariah-compliant finance, and related financial topics.
          If the question is unrelated, respond with exactly: "I can only assist with Islamic finance and related topics."
          Be concise and helpful.`,
        },
      ],
    };

    // Format the entire conversation history for the Gemini API, ensuring roles alternate
    const conversationHistoryForApi = updatedMessages.map((msg) => ({
      role: msg.role === "bot" ? "model" : msg.role, // Map 'bot' to 'model' for API
      parts: [{ text: msg.text }],
    }));

    // Construct the final contents array for the API call
    // The system instruction comes first, then the actual conversation history.
    // This ensures the correct 'user' (system) -> 'model' (bot's greeting) -> 'user' (user's input) alternation.
    const contentsToSend = [systemInstructionContent, ...conversationHistoryForApi];

    try {
      // Make the API call with the entire conversation history and system instruction
      const response = await axios.post(
        GEMINI_CHAT_URL, // Use the chat URL
        {
          contents: contentsToSend, // Send all previous messages + current instruction
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Extract the bot's reply from the API response
      const botReply =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't process your request. Please try again.";

      // Add the bot's reply to the chat history
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", text: botReply },
      ]);
    } catch (error) {
      console.error("Gemini API error:", error);
      // Display an error message if the API call fails
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", text: "Error contacting AI service. Please try again." },
      ]);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };


  return (
    <div className="fixed bottom-4 right-4 z-50 font-inter">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-900 transition-all duration-300 transform hover:scale-105"
          aria-label="Open Chatbot" // Accessibility improvement
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white border border-gray-500 rounded-lg shadow-lg w-90 h-[500px] flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-gray-900 text-white rounded-t-lg p-3 flex justify-between items-center">
            <span className="font-semibold text-lg">Finance Chatbot</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300 text-2xl"
              aria-label="Close Chatbot" // Accessibility improvement
            >
              ✖
            </button>
          </div>

          {/* Messages Display Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[75%] p-3 rounded-xl shadow-sm break-words ${ // Increased padding, rounded corners
                  msg.role === "user"
                    ? "bg-blue-600 text-white self-end ml-auto" // User messages
                    : "bg-gray-200 text-gray-800 self-start mr-auto" // Bot messages
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && ( // Only show thinking for main chat operation
              <div className="text-gray-500 text-sm italic p-2">Thinking...</div>
            )}
            {/* Div to scroll into view for latest message */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 flex items-center border-t border-gray-300">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-400 rounded-l-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="Ask about Islamic finance..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading} // Only disable input while main chat loading
            />
            <button
              onClick={sendMessage}
              className="bg-blue-700 text-white px-5 py-3 rounded-r-lg hover:bg-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading} // Only disable button while main chat loading
            >
              Send
            </button>
            {/* Removed the "Suggest Topics" button */}
          </div>
        </div>
      )}
    </div>
  );
}