
import React from "react";
import EditableTaskList from "@/components/dashboard/EditableTaskList";
import WeatherCard from "@/components/dashboard/WeatherCard";
import FieldStatus from "@/components/dashboard/FieldStatus";
import AgentChatInterface from "@/components/chat/AgentChatInterface";
import PlanningCalendar from "@/components/planning/Calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black mb-6">
        Farm Dashboard
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="mb-4 bg-agrifirm-light-yellow-2/50">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="mt-0">
              <EditableTaskList />
            </TabsContent>
            <TabsContent value="planning" className="mt-0">
              <PlanningCalendar />
            </TabsContent>
          </Tabs>
          
          <AgentChatInterface />
        </div>
        <div className="space-y-6">
          <WeatherCard />
          <FieldStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
