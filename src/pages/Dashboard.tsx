import React from "react";
import EditableTaskList from "@/components/dashboard/EditableTaskList";
import WeatherCard from "@/components/dashboard/WeatherCard";
import FieldStatus from "@/components/dashboard/FieldStatus";
import AgentChatInterface from "@/components/chat/AgentChatInterface";
import PlanningCalendar from "@/components/planning/Calendar";
import NotificationList from "@/components/notifications/NotificationList";
import AdvisorSupportRequest from "@/components/advisor/AdvisorSupportRequest";
import AdvisorInfo from "@/components/advisor/AdvisorInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/context/NotificationContext";
import { useEvents } from "@/context/EventContext";
import { Bell, UserRound } from "lucide-react";

const Dashboard = () => {
  const { notifications } = useNotifications();
  const { events } = useEvents();
  
  // Only count farmer notifications
  const farmerNotifications = notifications.filter(n => n.viewType === "farmer");
  const unreadCount = farmerNotifications.filter(n => !n.read).length;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black mb-6">
        Farm Dashboard
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="mb-4 bg-agrifirm-light-yellow-2/50">
              <TabsTrigger value="tasks">My Tasksssss</TabsTrigger>
              <TabsTrigger value="planning">My Schedule</TabsTrigger>
              <TabsTrigger value="advisor">
                <UserRound className="h-4 w-4 mr-2" />
                Request Advisor Support
              </TabsTrigger>
              <TabsTrigger value="notifications" className="relative">
                My Alerts
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-agrifirm-green text-[10px] font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="mt-0">
              <EditableTaskList />
            </TabsContent>
            <TabsContent value="planning" className="mt-0">
              <PlanningCalendar events={events} />
            </TabsContent>
            <TabsContent value="advisor" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdvisorSupportRequest />
                <AdvisorInfo />
              </div>
            </TabsContent>
            <TabsContent value="notifications" className="mt-0">
              <NotificationList />
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
