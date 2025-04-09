
import { parseISO, addDays, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday } from "date-fns";

// Event type mapping keywords
const eventTypeKeywords = {
  planting: ["plant", "sow", "seed"],
  irrigation: ["water", "irrigate", "irrigation"],
  fertilizing: ["fertilize", "fertilizer", "feed"],
  harvesting: ["harvest", "collect", "pick"],
  maintenance: ["maintain", "maintenance", "repair", "check", "service"],
};

// Helper to determine event type based on message content
export const determineEventType = (message: string): "planting" | "irrigation" | "fertilizing" | "harvesting" | "maintenance" | "other" => {
  const lowerMessage = message.toLowerCase();
  
  for (const [type, keywords] of Object.entries(eventTypeKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return type as any;
    }
  }
  
  return "other";
};

// Parse relative date references
export const parseRelativeDate = (dateText: string): Date | null => {
  const today = new Date();
  const lowerDateText = dateText.toLowerCase();
  
  if (lowerDateText.includes("today")) {
    return today;
  }
  
  if (lowerDateText.includes("tomorrow")) {
    return addDays(today, 1);
  }
  
  if (lowerDateText.includes("next monday")) {
    return nextMonday(today);
  }
  
  if (lowerDateText.includes("next tuesday")) {
    return nextTuesday(today);
  }
  
  if (lowerDateText.includes("next wednesday")) {
    return nextWednesday(today);
  }
  
  if (lowerDateText.includes("next thursday")) {
    return nextThursday(today);
  }
  
  if (lowerDateText.includes("next friday")) {
    return nextFriday(today);
  }
  
  if (lowerDateText.includes("next saturday")) {
    return nextSaturday(today);
  }
  
  if (lowerDateText.includes("next sunday")) {
    return nextSunday(today);
  }
  
  // Handle "next week" as 7 days from now
  if (lowerDateText.includes("next week")) {
    return addDays(today, 7);
  }
  
  return null;
};

// Extract a potential event from a user message
export const extractEventFromMessage = (message: string) => {
  // First, check if this is likely a calendar command
  const calendarActionKeywords = [
    "schedule", "add", "create", "set up", "plan", "book", "arrange"
  ];
  
  const isCalendarAction = calendarActionKeywords.some(
    keyword => message.toLowerCase().includes(keyword)
  );
  
  if (!isCalendarAction) {
    return null;
  }
  
  // Try to extract date
  let eventDate: Date | null = null;
  const datePatterns = [
    // Look for patterns like "next monday", "tomorrow", etc.
    /(?:on|for|this|next) (monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|tomorrow|today)/i,
    // Look for specific dates like "April 15" or "4/15/2025"
    /(?:on|for) ([a-z]+ \d{1,2}(?:st|nd|rd|th)?)/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      eventDate = parseRelativeDate(match[1]);
      if (eventDate) break;
    }
  }
  
  // If no date could be extracted, default to tomorrow
  if (!eventDate) {
    eventDate = addDays(new Date(), 1);
  }
  
  // Extract title - simple approach to get the main topic
  let title = "New Event";
  // Look for phrases like "Schedule a meeting" or "Plan irrigation"
  const titleMatch = message.match(/(?:schedule|add|create|set up|plan|book|arrange) (?:a|an)? (.+?)(?:on|for|tomorrow|today|next|this|$)/i);
  
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
    // Clean up the title by removing articles and extra words
    title = title.replace(/^(a|an|the) /i, '');
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  // Determine event type
  const eventType = determineEventType(message);
  
  return {
    date: eventDate,
    title,
    type: eventType,
    description: "", // Default to empty description
  };
};
