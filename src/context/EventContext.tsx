
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Event } from "@/types";

interface EventContextProps {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => string;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
}

// Sample calendar event data - With advisor-specific events
const sampleEvents: Event[] = [
  {
    id: "1",
    date: new Date(2025, 3, 10), // April 10, 2025
    title: "Farm Visit - Johnson Farm",
    description: "Soil sampling and crop assessment",
    type: "visit",
    status: "pending"
  },
  {
    id: "2",
    date: new Date(2025, 3, 12), // April 12, 2025
    title: "Client Meeting - Williams Farm",
    description: "Discuss crop rotation plan and fertilizer recommendations",
    type: "meeting",
    status: "in progress"
  },
  {
    id: "3",
    date: new Date(2025, 3, 15), // April 15, 2025
    title: "Regional Agricultural Conference",
    description: "Present new sustainable farming practices",
    type: "conference",
    status: "pending"
  },
  {
    id: "4",
    date: new Date(2025, 3, 18), // April 18, 2025
    title: "Quarterly Client Reviews",
    description: "Performance reviews for all client farms",
    type: "review",
    status: "completed"
  },
  {
    id: "5",
    date: new Date(2025, 3, 20), // April 20, 2025
    title: "Training Workshop - Advanced Soil Management",
    description: "Host workshop for local farmers",
    type: "training",
    status: "pending"
  }
];

const EventContext = createContext<EventContextProps | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(sampleEvents);

  const addEvent = (eventData: Omit<Event, "id">) => {
    const id = Date.now().toString();
    const newEvent = { ...eventData, id };
    setEvents(prev => [...prev, newEvent]);
    return id;
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prev => 
      prev.map(event => event.id === id ? { ...event, ...updates } : event)
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
