
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function sendChatRequest(
  messages: Message[],
  apiKey: string
): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

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
    
    // Create the toast inside the component using the hook
    if (typeof window !== "undefined") {
      // This is a client-side error, we'll let the component handle it
      throw error;
    }
    
    return "I encountered an error while processing your request. Please check your API key or try again later.";
  }
}
