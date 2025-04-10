
import React from "react";
import PlanningCalendar from "@/components/planning/Calendar";
import { useEvents } from "@/context/EventContext";

const Planning = () => {
  const { events } = useEvents();
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black mb-6">
        Farm Planning
      </h1>
      <PlanningCalendar events={events} />
    </div>
  );
};

export default Planning;
