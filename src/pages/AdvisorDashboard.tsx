
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/AdvisorNavbar";
import { useEvents } from "@/context/EventContext";
import { useNotifications } from "@/context/NotificationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlanningCalendar from "@/components/planning/Calendar";
import NotificationList from "@/components/notifications/NotificationList";
import EditableTaskList from "@/components/dashboard/EditableTaskList";
import AgentChatInterface from "@/components/chat/AgentChatInterface";
import { Bell, CalendarDays, ListTodo, UserRound } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock farmer data
const farmers = [
  {
    id: "farmer1",
    name: "John Smith",
    farm: "Green Valley Farm",
    location: "Iowa",
    crops: ["Corn", "Soybeans"],
    size: "120 acres"
  },
  {
    id: "farmer2",
    name: "Maria Rodriguez",
    farm: "Sunny Meadows",
    location: "California",
    crops: ["Tomatoes", "Lettuce", "Strawberries"],
    size: "45 acres"
  }
];

const AdvisorDashboard = () => {
  const { events } = useEvents();
  const { notifications } = useNotifications();
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0].id);
  
  const selectedFarmer = farmers.find(farmer => farmer.id === selectedFarmerId) || farmers[0];
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <>
      <Helmet>
        <title>Advisor Dashboard - Crop Compass</title>
        <meta name="description" content="Advisor dashboard to manage and monitor farms" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-white to-agrifirm-light-yellow-2/30">
        <Navbar />
        <main className="container mx-auto py-6 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black">
              Advisor Dashboard
            </h1>
            
            <div className="w-full sm:w-72">
              <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
                <SelectTrigger className="bg-white border-agrifirm-light-green">
                  <SelectValue placeholder="Select a farmer" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((farmer) => (
                    <SelectItem key={farmer.id} value={farmer.id}>
                      {farmer.name} - {farmer.farm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card className="mb-6 border-agrifirm-light-green/40 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-agrifirm-light-green/10 to-agrifirm-light-yellow-2/10 pb-2">
              <CardTitle className="text-lg text-agrifirm-black">Farmer Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-agrifirm-grey">Farmer</h3>
                  <p className="text-agrifirm-black font-semibold">{selectedFarmer.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-agrifirm-grey">Farm Name</h3>
                  <p className="text-agrifirm-black font-semibold">{selectedFarmer.farm}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-agrifirm-grey">Location</h3>
                  <p className="text-agrifirm-black font-semibold">{selectedFarmer.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-agrifirm-grey">Farm Size</h3>
                  <p className="text-agrifirm-black font-semibold">{selectedFarmer.size}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-agrifirm-grey">Crops</h3>
                  <p className="text-agrifirm-black font-semibold">{selectedFarmer.crops.join(", ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="mb-4 bg-agrifirm-light-yellow-2/50">
                  <TabsTrigger value="tasks">
                    <ListTodo className="h-4 w-4 mr-2" />
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger value="planning">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Planning
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="relative">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
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
                <TabsContent value="notifications" className="mt-0">
                  <NotificationList />
                </TabsContent>
              </Tabs>
              
              <Card className="border-agrifirm-light-green/40 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-agrifirm-light-green/10 to-agrifirm-light-yellow-2/10 pb-2">
                  <CardTitle className="text-lg text-agrifirm-black">Ask Agnes</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <AgentChatInterface />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdvisorDashboard;
