
type Message = {
  role: "system" | "user" | "assistant";
  content: string | Array<{type: "text" | "image_url", text?: string, image_url?: {url: string}}>;
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
        model: "gpt-4o", // Using gpt-4o since it supports vision
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
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Invalid API key. Please check your OpenAI API key and try again.");
      } else if (error.message.includes("rate limit")) {
        throw new Error("OpenAI rate limit exceeded. Please try again in a few moments.");
      } else if (error.message.includes("maximum context length")) {
        throw new Error("The conversation is too long. Please clear the chat and start a new conversation.");
      }
    }
    
    throw new Error("An error occurred while processing your request. Please try again later.");
  }
}
