
import React from "react";
import PlanningCalendar from "@/components/planning/Calendar";
import { useEvents } from "@/context/EventContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Planning = () => {
  const { events } = useEvents();
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black mb-6">
        Farm Planning
      </h1>
      <Card className="shadow-md border-agrifirm-light-green/40">
        <CardHeader className="bg-gradient-to-r from-agrifirm-light-green/10 to-agrifirm-light-yellow-2/10 pb-2">
          <CardTitle className="text-xl text-agrifirm-black">Calendar & Events</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <PlanningCalendar events={events} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Planning;
