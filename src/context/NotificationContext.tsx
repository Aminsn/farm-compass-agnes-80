
import React, { createContext, useContext, useState, useEffect } from "react";

export type NotificationType = "advisor" | "order" | "recommendation";

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

  // Mock data with advisor-specific notifications
  useEffect(() => {
    const mockNotifications: Omit<Notification, "id" | "read">[] = [
      {
        type: "advisor",
        title: "Client Support Request",
        message: "John Smith from Green Valley Farm has requested assistance with a potential pest issue in his corn fields. Please schedule a visit within the next 48 hours.",
        date: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        actionRequired: true,
        actionText: "Schedule Visit",
      },
      {
        type: "order",
        title: "Test Results Available",
        message: "Soil sample test results for Williams farm are now available. Results indicate low potassium levels. Review and prepare recommendations.",
        date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        actionRequired: true,
        actionText: "Review Results",
      },
      {
        type: "recommendation",
        title: "Recommendation Review Required",
        message: "Your crop rotation recommendation for Blue Ridge Farm requires approval from the regional manager before sending to the client. Please review and submit for approval.",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        actionRequired: true,
        actionText: "Submit for Approval",
      },
      {
        type: "advisor",
        title: "Weather Alert for Client Regions",
        message: "Severe weather warning issued for Iowa region affecting 3 of your client farms. Consider sending preventative measures and recommendations.",
        date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        actionRequired: true,
        actionText: "Send Recommendations",
      },
      {
        type: "recommendation",
        title: "New Research Available",
        message: "New research on sustainable fertilizer application methods is now available in the knowledge base. This may be relevant for several of your client farms.",
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
