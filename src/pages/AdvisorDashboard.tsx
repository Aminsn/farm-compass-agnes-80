
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
import { Bell, CalendarDays, FileText, ListTodo, Search, UserRound, Users } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock farmer data
const farmers = [
  {
    id: "farmer1",
    name: "John Smith",
    farm: "Green Valley Farm",
    location: "Iowa",
    crops: ["Corn", "Soybeans"],
    size: "120 acres",
    kpis: {
      yieldPerAcre: "175 bushels",
      soilHealth: "Good",
      waterUsage: "18 gallons/acre",
      pestControl: "Minimal",
      profitMargin: "22%"
    }
  },
  {
    id: "farmer2",
    name: "Maria Rodriguez",
    farm: "Sunny Meadows",
    location: "California",
    crops: ["Tomatoes", "Lettuce", "Strawberries"],
    size: "45 acres",
    kpis: {
      yieldPerAcre: "4.2 tons",
      soilHealth: "Excellent",
      waterUsage: "22 gallons/acre",
      pestControl: "Organic",
      profitMargin: "19%"
    }
  },
  {
    id: "farmer3",
    name: "Robert Johnson",
    farm: "Blue Ridge Farm",
    location: "Virginia",
    crops: ["Apples", "Peaches"],
    size: "75 acres",
    kpis: {
      yieldPerAcre: "225 bushels",
      soilHealth: "Very Good",
      waterUsage: "15 gallons/acre",
      pestControl: "Integrated",
      profitMargin: "24%"
    }
  },
  {
    id: "farmer4",
    name: "Sarah Williams",
    farm: "Golden Fields",
    location: "Kansas",
    crops: ["Wheat", "Barley"],
    size: "200 acres",
    kpis: {
      yieldPerAcre: "52 bushels",
      soilHealth: "Moderate",
      waterUsage: "12 gallons/acre",
      pestControl: "Conventional",
      profitMargin: "18%"
    }
  }
];

const AdvisorDashboard = () => {
  const { events } = useEvents();
  const { notifications } = useNotifications();
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0].id);
  const [advisorView, setAdvisorView] = useState("personal");
  const [personalTab, setPersonalTab] = useState("tasks");
  const [customerTab, setCustomerTab] = useState("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  
  const selectedFarmer = farmers.find(farmer => farmer.id === selectedFarmerId) || farmers[0];
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredFarmers = farmers.filter(farmer => 
    farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    farmer.farm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter for advisor-specific notifications
  const advisorNotifications = notifications.filter(n => 
    n.type === "support_request" || n.type === "farm_alert" || n.type === "system"
  );
  
  // Custom advisor tasks data
  const advisorTasks = [
    { id: "1", title: "Review soil test results for Green Valley Farm", status: "pending" },
    { id: "2", title: "Prepare pest management recommendations", status: "in-progress" },
    { id: "3", title: "Schedule quarterly farmer meeting", status: "pending" },
    { id: "4", title: "Complete crop yield forecast report", status: "pending" },
    { id: "5", title: "Update sustainability recommendations", status: "completed" },
  ];
  
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
            
            <Tabs 
              value={advisorView} 
              onValueChange={setAdvisorView}
              className="w-full sm:w-auto"
            >
              <TabsList className="w-full sm:w-auto bg-agrifirm-light-yellow-2/50">
                <TabsTrigger value="personal" className="flex items-center">
                  <UserRound className="h-4 w-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="customers" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Customers
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <Tabs value={advisorView} onValueChange={setAdvisorView}>
            <TabsContent value="personal" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Tabs value={personalTab} onValueChange={setPersonalTab} className="w-full">
                    <TabsList className="mb-4 bg-agrifirm-light-yellow-2/50">
                      <TabsTrigger value="tasks">
                        <ListTodo className="h-4 w-4 mr-2" />
                        Advisor Tasks
                      </TabsTrigger>
                      <TabsTrigger value="planning">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Advisor Schedule
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="relative">
                        <Bell className="h-4 w-4 mr-2" />
                        Advisor Alerts
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-agrifirm-green text-[10px] font-medium text-white">
                            {unreadCount}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="tasks" className="mt-0">
                      <Card className="border-agrifirm-light-green/40 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-agrifirm-light-green/10 to-agrifirm-light-yellow-2/10 pb-2">
                          <CardTitle className="text-lg text-agrifirm-black">My Advisor Tasks</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            {advisorTasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between p-3 border border-agrifirm-light-green/30 rounded-md">
                                <div className="flex items-center">
                                  <div className={`h-3 w-3 rounded-full mr-3 ${
                                    task.status === 'completed' ? 'bg-green-500' : 
                                    task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'
                                  }`}></div>
                                  <span>{task.title}</span>
                                </div>
                                <span className="text-sm px-2 py-1 rounded-full bg-agrifirm-light-yellow-2/50">
                                  {task.status === 'completed' ? 'Completed' : 
                                   task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="planning" className="mt-0">
                      <Card className="border-agrifirm-light-green/40 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-agrifirm-light-green/10 to-agrifirm-light-yellow-2/10 pb-2">
                          <CardTitle className="text-lg text-agrifirm-black">Advisor Calendar</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <PlanningCalendar events={events} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="notifications" className="mt-0">
                      <Card className="border-agrifirm-light-green/40 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-agrifirm-light-green/10 to-agrifirm-light-yellow-2/10 pb-2">
                          <CardTitle className="text-lg text-agrifirm-black">Advisor Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            {advisorNotifications.length > 0 ? (
                              <NotificationList />
                            ) : (
                              <p className="text-agrifirm-grey text-center py-4">No new notifications</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="lg:col-span-1">
                  <Card className="border-agrifirm-light-green/40 shadow-sm h-full">
                    <CardHeader className="bg-gradient-to-r from-agrifirm-light-green/10 to-agrifirm-light-yellow-2/10 pb-2">
                      <CardTitle className="text-lg text-agrifirm-black">Ask Agnes</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <AgentChatInterface />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customers" className="mt-0">
              <div className="mb-6">
                <div className="w-full mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-agrifirm-grey" />
                    <Input
                      placeholder="Search farmers or farms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white pl-10 border-agrifirm-light-green w-full sm:w-72"
                    />
                  </div>
                </div>
                <div className="w-full mb-6">
                  <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
                    <SelectTrigger className="bg-white border-agrifirm-light-green w-full sm:w-72">
                      <SelectValue placeholder="Select a farmer" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredFarmers.map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id}>
                          {farmer.name} - {farmer.farm}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                
                <Card className="mb-6 border-agrifirm-light-green/40 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-agrifirm-light-green/10 to-agrifirm-light-yellow-2/10 pb-2">
                    <CardTitle className="text-lg text-agrifirm-black">Farm Performance KPIs</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Yield per Acre</TableCell>
                          <TableCell>{selectedFarmer.kpis.yieldPerAcre}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Good
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Soil Health</TableCell>
                          <TableCell>{selectedFarmer.kpis.soilHealth}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Good
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Water Usage</TableCell>
                          <TableCell>{selectedFarmer.kpis.waterUsage}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Average
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Pest Control Approach</TableCell>
                          <TableCell>{selectedFarmer.kpis.pestControl}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Good
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Profit Margin</TableCell>
                          <TableCell>{selectedFarmer.kpis.profitMargin}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Good
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <Tabs value={customerTab} onValueChange={setCustomerTab} className="w-full">
                    <TabsList className="mb-4 bg-agrifirm-light-yellow-2/50">
                      <TabsTrigger value="tasks">
                        <ListTodo className="h-4 w-4 mr-2" />
                        Customer Tasks
                      </TabsTrigger>
                      <TabsTrigger value="planning">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Customer Planning
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="relative">
                        <Bell className="h-4 w-4 mr-2" />
                        Customer Alerts
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
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AdvisorDashboard;
