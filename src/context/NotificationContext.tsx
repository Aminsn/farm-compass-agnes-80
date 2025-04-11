import React, { createContext, useContext, useState, useEffect } from "react";

export type NotificationType = "weather" | "crop" | "equipment" | "advisor";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  actionRequired?: boolean;
  actionText?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "read">) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock data with farmer-specific notifications
  useEffect(() => {
    const isAdvisorView = window.location.pathname.includes("/advisor");
    
    if (isAdvisorView) {
      // Advisor-specific notifications
      const advisorNotifications: Omit<Notification, "id" | "read">[] = [
        {
          type: "advisor",
          title: "New Support Request",
          message: "John Smith from Green Valley Farm has requested advice about leaf discoloration in his corn field.",
          date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          actionRequired: true,
          actionText: "Review Request",
        },
        {
          type: "advisor",
          title: "Farm Visit Scheduled",
          message: "You have an upcoming farm visit with Maria Rodriguez at Sunny Meadows tomorrow at 10:00 AM.",
          date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          actionRequired: true,
          actionText: "Confirm Visit",
        },
        {
          type: "advisor",
          title: "Soil Test Results Available",
          message: "Soil analysis results for Blue Ridge Farm are ready for review. pH levels show potential issues.",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          actionRequired: true,
          actionText: "View Results",
        },
        {
          type: "advisor",
          title: "Performance Report Ready",
          message: "The quarterly performance report for your region is ready. Overall crop yields are up 12% from last quarter.",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          actionRequired: false,
        },
        {
          type: "advisor",
          title: "Training Webinar Reminder",
          message: "Reminder: You're registered for the 'Advanced Pest Management' webinar tomorrow at 2:00 PM.",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          actionRequired: true,
          actionText: "Join Webinar",
        },
      ];
      
      setNotifications(
        advisorNotifications.map((notif) => ({
          ...notif,
          id: Math.random().toString(36).substring(2, 11),
          read: false,
        }))
      );
    } else {
      // Keep the existing farmer notifications
      const mockNotifications: Omit<Notification, "id" | "read">[] = [
        {
          type: "weather",
          title: "Frost Warning",
          message: "Temperature expected to drop below freezing tonight. Consider protecting sensitive crops in the east field.",
          date: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          actionRequired: true,
          actionText: "View Weather Forecast",
        },
        {
          type: "crop",
          title: "Corn Growth Stage Alert",
          message: "Your corn crop in the north field has reached the V6 growth stage. Time to apply side-dress nitrogen fertilizer within the next 3 days.",
          date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          actionRequired: true,
          actionText: "Schedule Application",
        },
        {
          type: "equipment",
          title: "Tractor Maintenance Due",
          message: "Your John Deere 8R tractor is due for scheduled maintenance. 50 engine hours remaining until service is required.",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          actionRequired: true,
          actionText: "Schedule Service",
        },
        {
          type: "weather",
          title: "Rain Forecast Updated",
          message: "The 5-day forecast has been updated. 1.5 inches of rain expected over the next 48 hours. Consider adjusting your irrigation schedule.",
          date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          actionRequired: true,
          actionText: "Adjust Irrigation",
        },
        {
          type: "crop",
          title: "Pest Detection Alert",
          message: "Aphid population detected in your soybean field. Current levels approaching economic threshold. Scout fields and consider treatment options.",
          date: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
          actionRequired: false,
        },
      ];

      setNotifications(
        mockNotifications.map((notif) => ({
          ...notif,
          id: Math.random().toString(36).substring(2, 11),
          read: false,
        }))
      );
    }
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const addNotification = (notification: Omit<Notification, "id" | "read">) => {
    setNotifications((prev) => [
      ...prev,
      {
        ...notification,
        id: Math.random().toString(36).substring(2, 11),
        read: false,
      },
    ]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead, clearNotification, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
