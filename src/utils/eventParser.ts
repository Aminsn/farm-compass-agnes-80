
import { parse, isValid, addDays } from "date-fns";

// Helper function to extract date from text
const extractDateFromText = (text: string): Date | null => {
  // Try to find dates in various formats
  
  // Check for "tomorrow", "today", "next week", etc.
  if (text.toLowerCase().includes("tomorrow")) {
    return addDays(new Date(), 1);
  } else if (text.toLowerCase().includes("today")) {
    return new Date();
  } else if (text.toLowerCase().includes("next week")) {
    return addDays(new Date(), 7);
  }
  
  // Check for day names (Monday, Tuesday, etc.)
  const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  for (const dayName of dayNames) {
    if (text.toLowerCase().includes(dayName)) {
      const today = new Date();
      const todayDay = today.getDay();
      const targetDay = dayNames.indexOf(dayName);
      let daysUntilNext = targetDay - todayDay;
      
      if (daysUntilNext <= 0) {
        daysUntilNext += 7; // If today or earlier this week, get next week
      }
      
      return addDays(today, daysUntilNext);
    }
  }
  
  // Check for specific date formats like "April 15" or "4/15"
  const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  for (const monthName of monthNames) {
    const regex = new RegExp(`${monthName}\\s+(\\d{1,2})(?:\\w{2})?`, "i");
    const match = text.match(regex);
    
    if (match && match[1]) {
      const day = parseInt(match[1], 10);
      const month = monthNames.indexOf(monthName.toLowerCase());
      const year = new Date().getFullYear();
      
      // Create date (months are 0-indexed in JavaScript)
      const date = new Date(year, month, day);
      
      // If the date is in the past, assume next year
      if (date < new Date()) {
        date.setFullYear(year + 1);
      }
      
      return date;
    }
  }
  
  // Check for MM/DD format
  const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1], 10) - 1; // Months are 0-indexed
    const day = parseInt(dateMatch[2], 10);
    const year = new Date().getFullYear();
    
    const date = new Date(year, month, day);
    
    // If the date is in the past, assume next year
    if (date < new Date()) {
      date.setFullYear(year + 1);
    }
    
    return date;
  }
  
  return null;
};

// Function to determine event type from text
const determineEventType = (text: string): "planting" | "irrigation" | "fertilizing" | "harvesting" | "maintenance" | "other" => {
  const lowerText = text.toLowerCase();
  
  if (/plant|seed|sow/i.test(lowerText)) {
    return "planting";
  } else if (/irrigat|water/i.test(lowerText)) {
    return "irrigation";
  } else if (/fertiliz|nutrient/i.test(lowerText)) {
    return "fertilizing";
  } else if (/harvest|collect|gather|pick/i.test(lowerText)) {
    return "harvesting";
  } else if (/maintenance|repair|check|inspect|fix/i.test(lowerText)) {
    return "maintenance";
  }
  
  return "other";
};

// Main function to extract event details from a message
export const extractEventFromMessage = (message: string) => {
  // Look for patterns suggesting calendar events
  if (!/schedule|calendar|event|plan|remind|add to calendar/i.test(message)) {
    return null;
  }
  
  // Extract the date
  const date = extractDateFromText(message);
  if (!date) {
    return null;
  }
  
  // Determine event type
  const type = determineEventType(message);
  
  // Extract title (this is a simplified approach)
  let title = "";
  
  // Try to extract title based on common patterns
  const patterns = [
    /schedule\s+([^.?!]+)/i,
    /add\s+([^.?!]+)\s+to\s+calendar/i,
    /plan\s+([^.?!]+)/i,
    /reminder\s+for\s+([^.?!]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      title = match[1].trim();
      // Clean up title by removing date references
      title = title.replace(/tomorrow|today|next week|next month|on \w+ \d+|\d+\/\d+/gi, "").trim();
      if (title) break;
    }
  }
  
  // If no title was found through patterns, create a generic one based on type
  if (!title) {
    switch (type) {
      case "planting":
        title = "Planting";
        break;
      case "irrigation":
        title = "Irrigation";
        break;
      case "fertilizing":
        title = "Fertilizing";
        break;
      case "harvesting":
        title = "Harvesting";
        break;
      case "maintenance":
        title = "Maintenance";
        break;
      default:
        title = "Farm Event";
    }
  }
  
  return {
    date,
    title,
    type,
    description: ""
  };
};
