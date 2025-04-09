
import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, HelpCircle, X, Settings, Calendar as CalendarIcon } from "lucide-react";
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
    content: "Hello! I'm Agnes, your farming assistant. I can help with farming advice and manage your calendar. Try saying 'Schedule irrigation for next Tuesday' or ask me about farming practices!",
    sender: "assistant",
    timestamp: new Date()
  }
];

// Sample suggested questions
const suggestedQuestions = [
  "When is the best time to plant corn?",
  "Schedule a maintenance task for tomorrow",
  "Add fertilizing to my calendar for next week",
  "Plan harvesting for next Monday",
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
  Focus on sustainable farming practices when appropriate.
  You can also help manage the farmer's calendar - you'll let them know when you've added events.`
};

type EventConfirmation = {
  event: {
    date: Date;
    title: string;
    type: "planting" | "irrigation" | "fertilizing" | "harvesting" | "maintenance" | "other";
    description: string;
  };
  showConfirmation: boolean;
};

const ChatInterface = () => {
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
  const { events, addEvent } = useEvents();
  
  // State for confirming calendar events
  const [eventConfirmation, setEventConfirmation] = useState<EventConfirmation>({
    event: {
      date: new Date(),
      title: "",
      type: "other",
      description: ""
    },
    showConfirmation: false
  });
  
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

  // Send message to OpenAI and get response
  const getOpenAIResponse = async (question: string) => {
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
    
    // First, check if this is a calendar-related request
    const possibleEvent = extractEventFromMessage(question);
    
    if (possibleEvent) {
      // Show confirmation dialog for the event
      setEventConfirmation({
        event: possibleEvent,
        showConfirmation: true
      });
    }
    
    try {
      // Check if API key is available
      if (!apiKey) {
        setIsApiKeyDialogOpen(true);
        setIsTyping(false);
        return;
      }
      
      // Prepare messages for API
      const apiMessages = prepareMessagesForAPI(question);
      
      // Get response from OpenAI
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

  // Handle event confirmation
  const handleConfirmEvent = () => {
    const { event } = eventConfirmation;
    
    // Add the event to the calendar
    const eventId = addEvent(event);
    
    // Close the confirmation dialog
    setEventConfirmation(prev => ({
      ...prev,
      showConfirmation: false
    }));
    
    // Add a message from Agnes confirming the event was added
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      content: `I've added "${event.title}" to your calendar on ${format(event.date, 'EEEE, MMMM d, yyyy')}. You can view and manage it in your planning calendar.`,
      sender: "assistant",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    
    // Show a toast notification
    toast({
      title: "Event Added",
      description: `"${event.title}" has been added to your calendar.`,
    });
  };
  
  // Cancel event addition
  const handleCancelEvent = () => {
    setEventConfirmation(prev => ({
      ...prev,
      showConfirmation: false
    }));
    
    // Add a message from Agnes that the event wasn't added
    const cancelMessage: Message = {
      id: Date.now().toString(),
      content: "I've cancelled adding that event to your calendar. Is there anything else I can help you with?",
      sender: "assistant",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, cancelMessage]);
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      // Use OpenAI if API key is available, otherwise show dialog
      if (apiKey) {
        getOpenAIResponse(input.trim());
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
      if (input.trim()) {
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
                  Agnes is your AI farming assistant powered by OpenAI. You can ask questions about:
                </p>
                <ul className="text-sm text-agrifirm-grey space-y-1 ml-4 list-disc">
                  <li>Crop planning and planting</li>
                  <li>Soil management</li>
                  <li>Pest and disease control</li>
                  <li>Weather impacts</li>
                  <li>Harvest timing</li>
                </ul>
                <p className="text-sm text-agrifirm-grey mt-2">
                  <strong>Calendar Management:</strong> Agnes can also help you manage your farm calendar.
                  Try asking things like:
                </p>
                <ul className="text-sm text-agrifirm-grey space-y-1 ml-4 list-disc">
                  <li>Schedule irrigation for next Tuesday</li>
                  <li>Add a planting task for tomorrow</li>
                  <li>Set up a maintenance check next week</li>
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
      
      {/* Event Confirmation Dialog */}
      <Dialog 
        open={eventConfirmation.showConfirmation} 
        onOpenChange={(open) => {
          if (!open) handleCancelEvent();
          setEventConfirmation(prev => ({...prev, showConfirmation: open}));
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-agrifirm-green" />
              Add Event to Calendar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Event Details</Label>
              <div className="rounded-md border p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Title:</span>
                  <span className="text-sm">{eventConfirmation.event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm">{format(eventConfirmation.event.date, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Type:</span>
                  <span className="text-sm capitalize">{eventConfirmation.event.type}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelEvent}>Cancel</Button>
              <Button onClick={handleConfirmEvent} className="bg-agrifirm-green hover:bg-agrifirm-green/90">
                Add to Calendar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
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
            placeholder="Ask Agnes about farming or schedule events..."
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
