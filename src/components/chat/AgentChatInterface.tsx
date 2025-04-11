
import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, HelpCircle, X, Settings, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sendChatRequest } from "@/utils/openai";
import { extractEventFromMessage } from "@/utils/eventParser";
import { useEvents } from "@/context/EventContext";
import { format } from "date-fns";
import { parseAgentActions, useAgentExecutor } from "@/utils/agentFramework";
import { useTaskContext } from "@/context/TaskContext";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  image?: string; // Base64 string for uploaded images
};

// Sample initial messages
const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm Agnes, your farming assistant. I can help with farming advice and manage your calendar and tasks. I now have access to your farm's knowledge base to provide more specific information about your farm. Try asking me about your farm or agricultural practices!",
    sender: "assistant",
    timestamp: new Date()
  }
];

// Sample suggested questions
const suggestedQuestions = [
  "Tell me about my farm's soil conditions",
  "What crops am I currently growing?",
  "Add a task for fertilizing tomorrow",
  "Schedule irrigation for next Tuesday",
  "What's the recommended irrigation schedule for my farm?"
];

// Initial system message to define Agnes's role
const SYSTEM_MESSAGE = {
  role: "system",
  content: `You are Agnes, a helpful and knowledgeable AI farming assistant with agentic capabilities. 
  Your goal is to help farmers make the best decisions for their crops and land.
  You can manage the farmer's calendar events and task list. When they ask you to create, update, or delete tasks and events, 
  you'll take those actions automatically without asking for confirmation.
  
  You have access to specific information about the farmer's farm through their farm knowledge base and documents.
  Reference this information when answering questions about their specific farm conditions, crops, practices, etc.
  
  You can now also analyze images. When a user uploads an image of their farm, crops, or any farming-related item,
  analyze it and provide insights, identify issues, or make recommendations based on what you see.
  
  Provide clear, practical advice based on farming best practices.
  When you don't have specific information about a user's local conditions, acknowledge this
  and give general guidance while suggesting they consult local agricultural experts.
  Keep your responses concise and farmer-friendly, avoiding overly technical language.
  Focus on sustainable farming practices when appropriate.`
};

const AgentChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>(() => {
    // Try to get API key from localStorage if available
    return localStorage.getItem("openai_api_key") || "";
  });
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const { events, addEvent, deleteEvent } = useEvents();
  const { tasks } = useTaskContext();
  const { executeActions } = useAgentExecutor();
  const [farmDocContent, setFarmDocContent] = useState<string>("");
  const [externalKnowledgeBase, setExternalKnowledgeBase] = useState<string>("");
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  
  // New state for image handling
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch farm document and external knowledge base on first load
  useEffect(() => {
    const fetchFarmInformation = async () => {
      setIsDocLoading(true);
      setDocError(null);
      
      try {
        // Fetch farm document from storage
        const { data: farmDocData, error: farmDocError } = await supabase.functions.invoke('get-farm-doc');
        
        if (farmDocError) {
          console.error("Error fetching farm document:", farmDocError);
          setDocError("Failed to load farm document. Using general knowledge only.");
        } else if (farmDocData) {
          console.log("Farm document retrieved successfully");
          setFarmDocContent(farmDocData.documentContent || "");
        }
        
        // Fetch external knowledge base
        const { data: externalKnowledgeData, error: externalKnowledgeError } = await supabase.functions.invoke('get-external-knowledge');
        
        if (externalKnowledgeError) {
          console.error("Error fetching external knowledge base:", externalKnowledgeError);
          setDocError((prev) => prev ? `${prev} And failed to load external knowledge base.` : "Failed to load external knowledge base. Using general knowledge only.");
        } else if (externalKnowledgeData) {
          console.log("External knowledge base retrieved successfully");
          setExternalKnowledgeBase(externalKnowledgeData.knowledgeBaseContent || "");
        }
      } catch (err) {
        console.error("Error invoking Supabase functions:", err);
        setDocError("Failed to load farm information. Using general knowledge only.");
      } finally {
        setIsDocLoading(false);
      }
    };
    
    fetchFarmInformation();
  }, []);
  
  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsImageUploading(true);
    const file = e.target.files?.[0];
    
    if (!file) {
      setIsImageUploading(false);
      return;
    }
    
    // Check file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      setIsImageUploading(false);
      return;
    }
    
    // Limit file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      setIsImageUploading(false);
      return;
    }
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      setIsImageUploading(false);
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read the image file",
        variant: "destructive",
      });
      setIsImageUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Save API key to localStorage whenever it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
    }
  }, [apiKey]);

  // Convert chat history to message format
  const prepareMessagesForAPI = (userMessage: string) => {
    const historyMessages = [];
    
    // Add system message first
    historyMessages.push(SYSTEM_MESSAGE);
    
    // Add farm document context if available
    const farmContextSources = [];
    
    if (farmDocContent) {
      farmContextSources.push(`FARM DOCUMENT: ${farmDocContent.slice(0, 4000)}`); // Limit to avoid exceeding token limits
    }
    
    if (externalKnowledgeBase) {
      farmContextSources.push(`FARM KNOWLEDGE BASE: ${externalKnowledgeBase.slice(0, 4000)}`); // Limit to avoid exceeding token limits
    }
    
    if (farmContextSources.length > 0) {
      const farmContext = {
        role: "system" as const,
        content: `Here is information about this specific farm that you should use when answering questions:
        ${farmContextSources.join("\n\n")}`
      };
      historyMessages.push(farmContext);
    }
    
    // Add task and event context
    const contextMessage = {
      role: "system" as const,
      content: `Current user context:
      - Tasks: ${tasks.map(t => `${t.title} (${t.status})`).join(', ')}
      - Events: ${events.map(e => `${e.title} on ${format(e.date, 'MMM d, yyyy')}`).join(', ')}`
    };
    historyMessages.push(contextMessage);
    
    // Add up to 10 most recent messages from chat history (to stay within context limits)
    const recentMessages = messages.slice(-10);
    
    recentMessages.forEach(msg => {
      if (msg.image) {
        // If the message has an image, create content with both text and image
        historyMessages.push({
          role: msg.sender === "user" ? "user" : "assistant",
          content: [
            { type: "text", text: msg.content },
            { type: "image_url", image_url: { url: msg.image } }
          ]
        });
      } else {
        // Regular text message
        historyMessages.push({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content
        });
      }
    });
    
    // Add the new user message, with image if available
    if (selectedImage) {
      historyMessages.push({
        role: "user",
        content: [
          { type: "text", text: userMessage },
          { type: "image_url", image_url: { url: selectedImage } }
        ]
      });
    } else {
      historyMessages.push({
        role: "user",
        content: userMessage
      });
    }
    
    return historyMessages;
  };

  // Process agent actions from the user's message
  const processAgentActions = (userMessage: string): string => {
    const actions = parseAgentActions(userMessage);
    if (actions.length === 0) return "";
    
    const results = executeActions(actions);
    return results.join("\n");
  };

  // Auto-create calendar event from message without confirmation
  const autoCreateEventFromMessage = (message: string) => {
    const possibleEvent = extractEventFromMessage(message);
    
    if (possibleEvent) {
      // Add the event to the calendar automatically
      const eventId = addEvent(possibleEvent);
      
      // Show a toast notification
      toast({
        title: "Event Added",
        description: `"${possibleEvent.title}" has been added to your calendar.`,
      });
      
      return `I've added "${possibleEvent.title}" to your calendar on ${format(possibleEvent.date, 'EEEE, MMMM d, yyyy')}.`;
    }
    
    return "";
  };

  // Send message to OpenAI and get response
  const getOpenAIResponse = async (question: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      sender: "user",
      timestamp: new Date(),
      image: selectedImage || undefined
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
      
      // Process any agent actions in the message
      const agentResults = processAgentActions(question);
      
      // Automatically create event from the message if possible
      const eventResult = autoCreateEventFromMessage(question);
      
      // Prepare messages for API
      const apiMessages = prepareMessagesForAPI(question);
      
      // Get response from OpenAI
      let responseContent = await sendChatRequest(apiMessages, apiKey);
      
      // If we performed agent actions or created an event, add them to the response
      let agentActions = [];
      if (agentResults) agentActions.push(agentResults);
      if (eventResult) agentActions.push(eventResult);
      
      if (agentActions.length > 0) {
        responseContent = `${agentActions.join("\n\n")}\n\n${responseContent}`;
      }
      
      // Add Agnes response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Clear the selected image after the request is complete
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error is already handled in sendChatRequest
      console.error("Failed to get response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (input.trim() || selectedImage) {
      // Use OpenAI if API key is available, otherwise show dialog
      if (apiKey) {
        getOpenAIResponse(input.trim());
      } else {
        // Show dialog to enter API key
        setIsApiKeyDialogOpen(true);
      }
    } else {
      toast({
        title: "Empty message",
        description: "Please enter a message or upload an image",
        variant: "destructive",
      });
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
      getOpenAIResponse(question);
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
      localStorage.setItem("openai_api_key", apiKey);
      setIsApiKeyDialogOpen(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved securely.",
      });
      
      // If there was a pending message, send it now
      if (input.trim() || selectedImage) {
        getOpenAIResponse(input.trim());
      }
    } else {
      toast({
        title: "API Key Required",
        description: "Please enter a valid OpenAI API key.",
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
          {isDocLoading && <span className="text-xs animate-pulse ml-2">Loading farm data...</span>}
          {docError && <span className="text-xs text-red-200 ml-2">Using partial knowledge only</span>}
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
                <DialogTitle>OpenAI API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Enter your OpenAI API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
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
                  Agnes is your AI farming assistant powered by OpenAI. You can ask about:
                </p>
                <ul className="text-sm text-agrifirm-grey space-y-1 ml-4 list-disc">
                  <li>Your specific farm conditions from the knowledge base</li>
                  <li>Crop planning and planting</li>
                  <li>Soil management</li>
                  <li>Pest and disease control</li>
                  <li>Weather impacts</li>
                  <li>Harvest timing</li>
                </ul>
                <p className="text-sm text-agrifirm-grey mt-2">
                  <strong>Image Analysis:</strong> Upload images of your crops, soil, or farm issues for AI analysis.
                </p>
                <p className="text-sm text-agrifirm-grey mt-2">
                  <strong>Task & Calendar Management:</strong> Agnes can help you manage tasks and events.
                  Try asking things like:
                </p>
                <ul className="text-sm text-agrifirm-grey space-y-1 ml-4 list-disc">
                  <li>Add a task for fertilizing tomorrow</li>
                  <li>Schedule irrigation for next Tuesday</li>
                  <li>Mark the "Check Fields" task as complete</li>
                  <li>Show me my current tasks</li>
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
                {message.image && (
                  <div className="mb-2 rounded overflow-hidden max-w-xs">
                    <img 
                      src={message.image} 
                      alt="User uploaded" 
                      className="max-w-full h-auto"
                    />
                  </div>
                )}
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
        {selectedImage && (
          <div className="mb-2 relative rounded border border-agrifirm-light-green/30 p-1 inline-block">
            <img 
              src={selectedImage} 
              alt="Upload preview" 
              className="h-16 rounded"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
              onClick={removeSelectedImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Agnes about your farm or upload an image for analysis..."
            className="flex-1 resize-none border rounded-md p-2 h-12 farm-input"
            rows={1}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImageUploading}
            className="border-agrifirm-light-green/30"
          >
            {isImageUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className="farm-button"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentChatInterface;
