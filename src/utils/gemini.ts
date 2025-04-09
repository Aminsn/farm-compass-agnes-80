
import { toast } from "@/hooks/use-toast";

// Types for Gemini messages
export type GeminiRole = "user" | "model";

export interface GeminiMessage {
  role: GeminiRole;
  parts: string[];
}

export interface GeminiStreamPayload {
  contents: GeminiMessage[];
  generationConfig: {
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
  };
}

// Gemini API configuration
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Helper function to create a payload for Gemini API
export const createGeminiPayload = (
  messages: GeminiMessage[],
  apiKey: string
): RequestInit => {
  const payload: GeminiStreamPayload = {
    contents: messages,
    generationConfig: {
      temperature: 0.7,
      topP: 1,
      topK: 40,
      maxOutputTokens: 1000,
    },
  };

  // Gemini API requires API key as query parameter
  const endpoint = `${API_URL}?key=${apiKey}`;

  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
};

// Convert OpenAI-style messages to Gemini format
export const convertToGeminiMessages = (
  messages: { role: string; content: string }[]
): GeminiMessage[] => {
  return messages
    .filter(msg => msg.role !== "system") // Gemini doesn't support system messages
    .map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [msg.content],
    }));
};

// Function to send a chat request to Gemini
export const sendChatRequest = async (
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<string> => {
  try {
    if (!apiKey) {
      throw new Error("Google Gemini API key is required");
    }

    // Convert OpenAI-style messages to Gemini format
    const geminiMessages = convertToGeminiMessages(messages);
    
    // Gemini API requires API key as query parameter
    const endpoint = `${API_URL}?key=${apiKey}`;
    
    const response = await fetch(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topP: 1,
            topK: 40,
            maxOutputTokens: 1000,
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to get response from Gemini"
      );
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    toast({
      title: "Chat Error",
      description: error instanceof Error ? error.message : "Failed to get response from Agnes",
      variant: "destructive",
    });
    throw error;
  }
};
