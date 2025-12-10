import React, { useState, useRef, useEffect } from "react";
import api from "../api";
import { MessageCircle } from "lucide-react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Assalamualaikum! I can help with Islamic finance calculators and Shariah-compliant financial queries. How can I help?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage = { role: "user", text: userInput };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput("");
    setLoading(true);

    try {
      // Call backend API instead of directly calling Gemini
      const response = await api.post("/chat", {
        message: userInput,
        history: updatedMessages.map((msg) => ({
          role: msg.role === "bot" ? "model" : msg.role,
          text: msg.text,
        })),
      });

      const botReply = response.data?.reply || "Sorry, I couldn't process your request. Please try again.";

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", text: botReply },
      ]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", text: "Error contacting AI service. Please try again." },
      ]);
    } finally {
      setLoading(false);
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
                className={`max-w-[75%] p-3 rounded-xl shadow-sm break-words ${
                  msg.role === "user"
                    ? "bg-white text-gray-800 border border-gray-300 self-end ml-auto" // User messages
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