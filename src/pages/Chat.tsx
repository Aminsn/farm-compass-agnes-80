
import React from "react";
import ChatInterface from "@/components/chat/ChatInterface";

const Chat = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black mb-2">
        Ask Agnes
      </h1>
      <p className="text-agrifirm-grey mb-6">
        Powered by Google Gemini, Agnes can help answer your farming questions.
      </p>
      <ChatInterface />
    </div>
  );
};

export default Chat;
