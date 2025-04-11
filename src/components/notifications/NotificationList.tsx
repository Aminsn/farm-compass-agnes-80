
import React, { useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import NotificationCard from "./NotificationCard";
import { Input } from "@/components/ui/input";
import { Bell, Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotificationList = () => {
  const { notifications } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  
  // Filter notifications based on current view (farmer or advisor)
  const isAdvisorView = window.location.pathname.includes("/advisor");
  const viewTypeFilter = isAdvisorView ? "advisor" : "farmer";
  
  const viewSpecificNotifications = notifications.filter(
    notification => notification.viewType === viewTypeFilter
  );

  const filteredNotifications = viewSpecificNotifications
    .filter((notification) => {
      // Filter by type if filter is active
      if (filter && notification.type !== filter) return false;
      
      // Search in title and message
      if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getFilterButtons = () => {
    if (isAdvisorView) {
      return [
        { label: "Advisory", value: "advisor" },
      ];
    } else {
      return [
        { label: "Weather", value: "weather" },
        { label: "Crop", value: "crop" },
        { label: "Equipment", value: "equipment" },
      ];
    }
  };

  const filterButtons = getFilterButtons();

  const clearFilters = () => {
    setFilter(null);
    setSearchTerm("");
  };

  const unreadCount = viewSpecificNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-agrifirm-green" />
          <h2 className="text-xl font-semibold">
            {isAdvisorView ? "Advisory Alerts" : "Farm Alerts"}
          </h2>
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-agrifirm-green text-white px-2 py-0.5 text-xs font-medium">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder={isAdvisorView ? "Search advisory alerts..." : "Search farm alerts..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {filterButtons.map((btn) => (
          <Button
            key={btn.value}
            variant={filter === btn.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filter === btn.value ? null : btn.value)}
            className={filter === btn.value ? "bg-agrifirm-green text-white" : ""}
          >
            {btn.label}
          </Button>
        ))}
        
        {(filter || searchTerm) && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
            <FilterX className="h-4 w-4 mr-2" />
            Clear filters
          </Button>
        )}
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <Bell className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium mb-1">
            {isAdvisorView ? "No advisory alerts found" : "No farm alerts found"}
          </h3>
          <p className="text-sm">
            {filter || searchTerm
              ? "Try changing your filters or search term"
              : isAdvisorView 
                ? "No pending alerts or requests at this time."
                : "Your fields are looking good! No alerts at this time."}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
