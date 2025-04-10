
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

  // Mock data for demonstration
  useEffect(() => {
    const mockNotifications: Omit<Notification, "id" | "read">[] = [
      {
        type: "advisor",
        title: "Message from your Agrifirm advisor",
        message: "Hi there! I've looked at your recent crop data and wanted to schedule a visit next week to discuss your winter wheat plans. Are you available on Tuesday afternoon?",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        actionRequired: true,
        actionText: "Reply",
      },
      {
        type: "order",
        title: "Fertilizer restock recommended",
        message: "I've noticed your nitrogen fertilizer is running low (15% remaining). I recommend ordering 500kg of AgriNitro Plus to be delivered by next Friday. This should cover your needs for the next planting cycle.",
        date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        actionRequired: true,
        actionText: "Approve Order",
      },
      {
        type: "recommendation",
        title: "Soil analysis completed",
        message: "Your recent soil samples indicate low nitrogen levels in fields 3 and 4. I recommend applying AgriBoost N+ fertilizer within the next 10 days for optimal results. Would you like me to create a treatment plan?",
        date: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
        actionRequired: true,
        actionText: "Create Plan",
      },
      {
        type: "advisor",
        title: "Weather alert from advisor",
        message: "A period of heavy rain is expected next week. Consider adjusting your irrigation schedule for fields 1 and 2 to prevent oversaturation. I've attached a revised schedule for your review.",
        date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
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
