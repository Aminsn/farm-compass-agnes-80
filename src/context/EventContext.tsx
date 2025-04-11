
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Event } from "@/types";

interface EventContextProps {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => string;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
}

// Add viewType to each event to distinguish between farmer and advisor events
const createSampleEvents = (viewType: "farmer" | "advisor"): Event[] => {
  if (viewType === "farmer") {
    // Farmer-specific events
    return [
      {
        id: "1",
        date: new Date(2025, 3, 10), // April 10, 2025
        title: "Plant Corn - North Field",
        description: "Weather conditions optimal for corn planting in the north field",
        type: "planting",
        status: "pending",
        viewType: "farmer"
      },
      {
        id: "2",
        date: new Date(2025, 3, 12), // April 12, 2025
        title: "Equipment Maintenance - Tractors",
        description: "Routine maintenance for John Deere tractors before spring planting continues",
        type: "maintenance",
        status: "pending",
        viewType: "farmer"
      },
      {
        id: "3",
        date: new Date(2025, 3, 15), // April 15, 2025
        title: "Fertilizer Delivery",
        description: "Scheduled delivery of nitrogen and phosphorus fertilizers",
        type: "delivery",
        status: "pending",
        viewType: "farmer"
      },
      {
        id: "4",
        date: new Date(2025, 3, 18), // April 18, 2025
        title: "Irrigation System Check",
        description: "Test and prepare irrigation systems for the growing season",
        type: "maintenance",
        status: "pending",
        viewType: "farmer"
      },
      {
        id: "5",
        date: new Date(2025, 3, 20), // April 20, 2025
        title: "Plant Soybeans - West Field",
        description: "Begin soybean planting in the west field rotation",
        type: "planting",
        status: "pending",
        viewType: "farmer"
      },
      {
        id: "6",
        date: new Date(2025, 3, 22), // April 22, 2025
        title: "Local Farmers Market",
        description: "Attend local farmers market to sell early season produce",
        type: "market",
        status: "pending",
        viewType: "farmer"
      },
      {
        id: "7",
        date: new Date(2025, 3, 25), // April 25, 2025
        title: "Apply Herbicide - South Field",
        description: "Apply pre-emergent herbicide to control weeds in the south field",
        type: "spraying",
        status: "pending",
        viewType: "farmer"
      },
      {
        id: "8",
        date: new Date(2025, 3, 28), // April 28, 2025
        title: "Livestock Veterinary Visit",
        description: "Routine health check for cattle herd",
        type: "livestock",
        status: "pending",
        viewType: "farmer"
      },
      {
        id: "9",
        date: new Date(2025, 3, 30), // April 30, 2025
        title: "Seed Inventory Check",
        description: "Inventory remaining seeds and place orders for additional supplies",
        type: "inventory",
        status: "pending",
        viewType: "farmer"
      }
    ];
  } else {
    // Advisor-specific events
    return [
      {
        id: "a1",
        date: new Date(2025, 3, 9), // April 9, 2025
        title: "Client Meeting - Green Valley Farm",
        description: "Discuss crop rotation strategies with John Smith",
        type: "meeting",
        status: "pending",
        viewType: "advisor"
      },
      {
        id: "a2",
        date: new Date(2025, 3, 11), // April 11, 2025
        title: "Farm Visit - Sunny Meadows",
        description: "On-site assessment of irrigation efficiency at Maria Rodriguez's farm",
        type: "visit",
        status: "pending",
        viewType: "advisor"
      },
      {
        id: "a3",
        date: new Date(2025, 3, 14), // April 14, 2025
        title: "Regional Conference",
        description: "Attend the Agricultural Innovation Conference in Kansas City",
        type: "conference",
        status: "pending",
        viewType: "advisor"
      },
      {
        id: "a4",
        date: new Date(2025, 3, 16), // April 16, 2025
        title: "Quarterly Review - Blue Ridge Farm",
        description: "Performance review of orchard management with Robert Johnson",
        type: "review",
        status: "pending",
        viewType: "advisor"
      },
      {
        id: "a5",
        date: new Date(2025, 3, 19), // April 19, 2025
        title: "Training Session - New Equipment",
        description: "Training session on the latest soil testing equipment",
        type: "training",
        status: "pending",
        viewType: "advisor"
      },
      {
        id: "a6",
        date: new Date(2025, 3, 23), // April 23, 2025
        title: "Demonstration - Precision Agriculture",
        description: "Demonstrate new precision agriculture technology at Golden Fields",
        type: "demonstration",
        status: "pending",
        viewType: "advisor"
      },
      {
        id: "a7",
        date: new Date(2025, 3, 26), // April 26, 2025
        title: "Monthly Reporting",
        description: "Complete monthly client progress reports for regional manager",
        type: "reporting",
        status: "pending",
        viewType: "advisor"
      },
      {
        id: "a8",
        date: new Date(2025, 3, 29), // April 29, 2025
        title: "New Client Consultation",
        description: "Initial consultation with potential new client farm in Nebraska",
        type: "meeting",
        status: "pending",
        viewType: "advisor"
      }
    ];
  }
};

const EventContext = createContext<EventContextProps | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  // Combine both farmer and advisor events
  const combinedEvents = [...createSampleEvents("farmer"), ...createSampleEvents("advisor")];
  const [events, setEvents] = useState<Event[]>(combinedEvents);

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
