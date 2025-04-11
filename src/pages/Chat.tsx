
import React, { useEffect } from "react";
import AgentChatInterface from "@/components/chat/AgentChatInterface";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Notify about pre-configured API key
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      toast({
        title: "API Key Pre-Configured",
        description: "Using a pre-configured API key for OpenAI integration.",
      });
    }
  }, [toast]);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black mb-2">
        Ask Agnes
      </h1>
      <p className="text-agrifirm-grey mb-6">
        Powered by AI, Agnes can help answer your farming questions using your farm's data and analyze crop images.
      </p>
      <AgentChatInterface />
    </div>
  );
};

export default Chat;
