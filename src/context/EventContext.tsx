
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Event } from "@/types";

interface EventContextProps {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => string;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
}

// Sample calendar event data - With farmer-specific events
const sampleEvents: Event[] = [
  {
    id: "1",
    date: new Date(2025, 3, 10), // April 10, 2025
    title: "Plant Corn - North Field",
    description: "Weather conditions optimal for corn planting in the north field",
    type: "planting",
    status: "pending"
  },
  {
    id: "2",
    date: new Date(2025, 3, 12), // April 12, 2025
    title: "Equipment Maintenance - Tractors",
    description: "Routine maintenance for John Deere tractors before spring planting continues",
    type: "maintenance",
    status: "pending"
  },
  {
    id: "3",
    date: new Date(2025, 3, 15), // April 15, 2025
    title: "Fertilizer Delivery",
    description: "Scheduled delivery of nitrogen and phosphorus fertilizers",
    type: "delivery",
    status: "pending"
  },
  {
    id: "4",
    date: new Date(2025, 3, 18), // April 18, 2025
    title: "Irrigation System Check",
    description: "Test and prepare irrigation systems for the growing season",
    type: "maintenance",
    status: "pending"
  },
  {
    id: "5",
    date: new Date(2025, 3, 20), // April 20, 2025
    title: "Plant Soybeans - West Field",
    description: "Begin soybean planting in the west field rotation",
    type: "planting",
    status: "pending"
  },
  {
    id: "6",
    date: new Date(2025, 3, 22), // April 22, 2025
    title: "Local Farmers Market",
    description: "Attend local farmers market to sell early season produce",
    type: "market",
    status: "pending"
  },
  {
    id: "7",
    date: new Date(2025, 3, 25), // April 25, 2025
    title: "Apply Herbicide - South Field",
    description: "Apply pre-emergent herbicide to control weeds in the south field",
    type: "spraying",
    status: "pending"
  },
  {
    id: "8",
    date: new Date(2025, 3, 28), // April 28, 2025
    title: "Livestock Veterinary Visit",
    description: "Routine health check for cattle herd",
    type: "livestock",
    status: "pending"
  },
  {
    id: "9",
    date: new Date(2025, 3, 30), // April 30, 2025
    title: "Seed Inventory Check",
    description: "Inventory remaining seeds and place orders for additional supplies",
    type: "inventory",
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
