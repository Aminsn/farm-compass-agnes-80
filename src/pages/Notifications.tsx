
import React from "react";
import NotificationList from "@/components/notifications/NotificationList";

const Notifications = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-agrifirm-black mb-6">
        Notifications
      </h1>
      <NotificationList />
    </div>
  );
};

export default Notifications;
