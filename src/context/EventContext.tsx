
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define event type (same as in Calendar.tsx)
export type CalendarEvent = {
  id: string;
  date: Date;
  title: string;
  description?: string;
  type: "planting" | "irrigation" | "fertilizing" | "harvesting" | "maintenance" | "other";
};

// Sample calendar event data from Calendar.tsx
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    date: new Date(2025, 3, 10), // April 10, 2025
    title: "Plant Corn",
    description: "North and East fields",
    type: "planting"
  },
  {
    id: "2",
    date: new Date(2025, 3, 12), // April 12, 2025
    title: "Tractor Maintenance",
    type: "maintenance"
  },
  {
    id: "3",
    date: new Date(2025, 3, 15), // April 15, 2025
    title: "Irrigation - South Field",
    type: "irrigation"
  },
  {
    id: "4",
    date: new Date(2025, 3, 18), // April 18, 2025
    title: "Apply Fertilizer",
    description: "All fields",
    type: "fertilizing"
  }
];

interface EventContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => string;
  deleteEvent: (id: string) => void;
  updateEvent: (event: CalendarEvent) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);

  const addEvent = (eventData: Omit<CalendarEvent, "id">) => {
    const id = Date.now().toString();
    const newEvent = { ...eventData, id };
    setEvents(prev => [...prev, newEvent]);
    return id;
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prev => 
      prev.map(event => event.id === updatedEvent.id ? updatedEvent : event)
    );
  };

  return (
    <EventContext.Provider value={{ events, addEvent, deleteEvent, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};
