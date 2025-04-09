
import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, HelpCircle, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sendChatRequest } from "@/utils/gemini";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

// Sample initial messages
const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm Agnes, your farming assistant. How can I help you today?",
    sender: "assistant",
    timestamp: new Date()
  }
];

// Sample suggested questions
const suggestedQuestions = [
  "When is the best time to plant corn?",
  "How can I improve soil quality?",
  "What fertilizer should I use for wheat?",
  "How to prevent common crop diseases?",
  "What's the optimal irrigation schedule for soybeans?"
];

// Initial system message to define Agnes's role
const SYSTEM_MESSAGE = {
  role: "system",
  content: `You are Agnes, a helpful and knowledgeable AI farming assistant. 
  Your goal is to help farmers make the best decisions for their crops and land.
  Provide clear, practical advice based on farming best practices.
  When you don't have specific information about a user's local conditions, acknowledge this
  and give general guidance while suggesting they consult local agricultural experts.
  Keep your responses concise and farmer-friendly, avoiding overly technical language.
  Focus on sustainable farming practices when appropriate.`
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>(() => {
    // Try to get API key from localStorage if available
    return localStorage.getItem("gemini_api_key") || "";
  });
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  // Save API key to localStorage whenever it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("gemini_api_key", apiKey);
    }
  }, [apiKey]);

  // Convert chat history to message format
  const prepareMessagesForAPI = (userMessage: string) => {
    const historyMessages = [];
    
    // Add system message first (Note: Gemini will filter this out as it doesn't support system messages)
    historyMessages.push(SYSTEM_MESSAGE);
    
    // Add up to 10 most recent messages from chat history (to stay within context limits)
    const recentMessages = messages.slice(-10);
    
    recentMessages.forEach(msg => {
      historyMessages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content
      });
    });
    
    // Add the new user message
    historyMessages.push({
      role: "user",
      content: userMessage
    });
    
    return historyMessages;
  };

  // Send message to Gemini and get response
  const getGeminiResponse = async (question: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    try {
      // Check if API key is available
      if (!apiKey) {
        setIsApiKeyDialogOpen(true);
        setIsTyping(false);
        return;
      }
      
      // Prepare messages for API
      const apiMessages = prepareMessagesForAPI(question);
      
      // Get response from Gemini
      const responseContent = await sendChatRequest(apiMessages, apiKey);
      
      // Add Agnes response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Error is already handled in sendChatRequest
      console.error("Failed to get response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // Legacy function for local responses without API (fallback)
  const simulateResponse = (question: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Simulate Agnes typing
    setTimeout(() => {
      let response = "";
      
      // Generate responses based on keywords in the question
      if (question.toLowerCase().includes("plant") || question.toLowerCase().includes("planting")) {
        response = "The best planting time depends on your local climate and the crop. For corn in temperate regions, late spring when soil temperatures reach 60°F (16°C) is ideal. Make sure to check your local frost dates and soil conditions before planting.";
      } else if (question.toLowerCase().includes("soil")) {
        response = "Improving soil quality involves regular testing, adding organic matter (like compost), practicing crop rotation, and using cover crops. Maintaining proper pH levels and avoiding soil compaction are also important practices.";
      } else if (question.toLowerCase().includes("fertilizer")) {
        response = "For wheat, a balanced NPK fertilizer with emphasis on nitrogen is typically recommended. Apply nitrogen in split applications - at planting and again at the jointing stage. Soil tests can help determine exact nutrient needs for your specific fields.";
      } else if (question.toLowerCase().includes("disease") || question.toLowerCase().includes("pest")) {
        response = "Preventing crop diseases starts with good field hygiene, crop rotation, and selecting resistant varieties. Regular monitoring, proper spacing for air circulation, and targeted treatments when necessary are key practices. Would you like information about a specific crop disease?";
      } else if (question.toLowerCase().includes("irrigation") || question.toLowerCase().includes("water")) {
        response = "For soybeans, the critical irrigation periods are during flowering and pod development. Generally, soybeans need about 1-1.5 inches of water per week. Using soil moisture sensors can help determine the optimal timing for irrigation.";
      } else {
        response = "That's a good question about farming. To give you the most accurate information, I'd need to know more about your specific location, climate, and growing conditions. Can you provide more details?";
      }
      
      // Add Agnes response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      // Use Gemini if API key is available, otherwise show dialog
      if (apiKey) {
        getGeminiResponse(input.trim());
      } else {
        // Show dialog to enter API key
        setIsApiKeyDialogOpen(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    if (apiKey) {
      getGeminiResponse(question);
    } else {
      setIsApiKeyDialogOpen(true);
    }
  };

  const clearChat = () => {
    setMessages(initialMessages);
    toast({
      title: "Chat cleared",
      description: "Your conversation has been reset.",
    });
  };

  // Save API key and close dialog
  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey);
      setIsApiKeyDialogOpen(false);
      toast({
        title: "API Key Saved",
        description: "Your Google Gemini API key has been saved securely.",
      });
      
      // If there was a pending message, send it now
      if (input.trim()) {
        getGeminiResponse(input.trim());
      }
    } else {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Google Gemini API key.",
        variant: "destructive",
      });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] border rounded-lg overflow-hidden">
      <div className="bg-agrifirm-green px-4 py-3 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h2 className="font-semibold">Agnes - Your Farming Assistant</h2>
        </div>
        <div className="flex gap-2">
          <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-agrifirm-green/80">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Google Gemini API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Enter your Google Gemini API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                  />
                  <p className="text-sm text-agrifirm-grey">
                    Your API key is stored only in your browser's local storage.
                  </p>
                </div>
                <Button onClick={saveApiKey} className="w-full">Save API Key</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-agrifirm-green/80">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h3 className="font-medium">About Agnes</h3>
                <p className="text-sm text-agrifirm-grey">
                  Agnes is your AI farming assistant powered by Google Gemini. You can ask questions about:
                </p>
                <ul className="text-sm text-agrifirm-grey space-y-1 ml-4 list-disc">
                  <li>Crop planning and planting</li>
                  <li>Soil management</li>
                  <li>Pest and disease control</li>
                  <li>Weather impacts</li>
                  <li>Harvest timing</li>
                </ul>
              </div>
            </PopoverContent>
          </Popover>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-agrifirm-green/80"
            onClick={clearChat}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 bg-agrifirm-light-yellow-2/20">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[80%] sm:max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender === "user" 
                    ? "bg-agrifirm-green text-white rounded-tr-none" 
                    : "bg-white border border-agrifirm-light-green/40 rounded-tl-none"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === "assistant" ? (
                    <Bot className="h-4 w-4 text-agrifirm-green" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.sender === "assistant" ? "Agnes" : "You"} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-agrifirm-light-green/40 rounded-lg rounded-tl-none px-4 py-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-agrifirm-green" />
                  <div className="flex gap-1">
                    <span className="animate-pulse">•</span>
                    <span className="animate-pulse delay-100">•</span>
                    <span className="animate-pulse delay-200">•</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {messages.length === 1 && (
        <div className="px-4 py-3 bg-agrifirm-light-green/10">
          <h3 className="text-sm font-medium text-agrifirm-black mb-2">Suggested Questions:</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-sm bg-white border border-agrifirm-light-green/30 px-3 py-1 rounded-full hover:bg-agrifirm-light-yellow-2 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t p-3 bg-white">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Agnes about farming..."
            className="flex-1 resize-none border rounded-md p-2 h-12 farm-input"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="farm-button"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
