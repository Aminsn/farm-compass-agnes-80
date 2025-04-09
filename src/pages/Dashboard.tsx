
import React from "react";
import TaskList from "@/components/dashboard/TaskList";
import WeatherCard from "@/components/dashboard/WeatherCard";
import FieldStatus from "@/components/dashboard/FieldStatus";

const Dashboard = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black mb-6">
        Farm Dashboard
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskList />
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
