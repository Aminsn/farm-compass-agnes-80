
import React from "react";
import ChatInterface from "@/components/chat/ChatInterface";

const Chat = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black mb-6">
        Ask Agnes
      </h1>
      <ChatInterface />
    </div>
  );
};

export default Chat;
