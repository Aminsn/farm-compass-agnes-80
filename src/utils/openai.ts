
import { toast } from "@/hooks/use-toast";

// Types for OpenAI messages
export type OpenAIRole = "system" | "user" | "assistant";

export interface OpenAIMessage {
  role: OpenAIRole;
  content: string;
}

export interface OpenAIStreamPayload {
  model: string;
  messages: OpenAIMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

// OpenAI API configuration
const API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o";

// Helper function to create a payload for OpenAI API
export const createOpenAIPayload = (
  messages: OpenAIMessage[],
  apiKey: string
): RequestInit => {
  const payload: OpenAIStreamPayload = {
    model: DEFAULT_MODEL,
    messages,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1000,
    stream: false,
    n: 1,
  };

  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  };
};

// Function to send a chat request to OpenAI
export const sendChatRequest = async (
  messages: OpenAIMessage[],
  apiKey: string
): Promise<string> => {
  try {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    const response = await fetch(API_URL, createOpenAIPayload(messages, apiKey));
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to get response from OpenAI"
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    toast({
      title: "Chat Error",
      description: error instanceof Error ? error.message : "Failed to get response from Agnes",
      variant: "destructive",
    });
    throw error;
  }
};
