
import React, { useState } from "react";
import NotificationList from "@/components/notifications/NotificationList";
import ContactAdvisorForm from "@/components/notifications/ContactAdvisorForm";
import AdvisorSupportRequest from "@/components/notifications/AdvisorSupportRequest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, MessageSquare, UserRound, Tractor } from "lucide-react";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState<string>("notifications");

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black mb-6">
        Communications Center
      </h1>
      
      <Tabs 
        defaultValue="notifications" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4 bg-agrifirm-light-yellow-2/50">
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="contact">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Advisor
          </TabsTrigger>
          <TabsTrigger value="support">
            <UserRound className="h-4 w-4 mr-2" />
            Request Advisor Support
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="mt-0">
          <NotificationList />
        </TabsContent>
        
        <TabsContent value="contact" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContactAdvisorForm />
            <div className="border rounded-lg p-4 bg-white">
              <h2 className="text-xl font-semibold mb-4">About Your Advisor</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-agrifirm-light-green/20 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-agrifirm-green" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Emma Johnson</h3>
                  <p className="text-gray-500">Farm Advisor - Agrifirm</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Your dedicated advisor is available to help with all farming concerns. Send messages
                and images for personalized advice on crops, soil health, pest control, and more.
              </p>
              <div className="bg-agrifirm-light-yellow-2/30 rounded p-3 text-sm">
                <strong>Response times:</strong> Typically within 24 hours during weekdays.
                For urgent matters, please call directly at 555-123-4567.
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="support" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdvisorSupportRequest />
            <div className="border rounded-lg p-4 bg-white">
              <h2 className="text-xl font-semibold mb-4">In-Person Support</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-agrifirm-light-green/20 flex items-center justify-center">
                  <Tractor className="h-8 w-8 text-agrifirm-green" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Field Visits & Consultation</h3>
                  <p className="text-gray-500">Expert on-site assistance</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Your advisor can visit your farm for hands-on assessment and personalized recommendations.
                In-person visits are ideal for complex issues requiring direct observation of crops, soil,
                or equipment.
              </p>
              <div className="bg-agrifirm-light-yellow-2/30 rounded p-3 text-sm">
                <strong>Scheduling:</strong> Visits are typically arranged within 1-2 weeks of request,
                subject to advisor availability. Emergency visits may be available within 48 hours.
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
