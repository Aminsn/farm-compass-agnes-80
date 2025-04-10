
import React from "react";
import { Notification } from "@/context/NotificationContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MessageSquare, Package, FileText, Bell } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { useToast } from "@/hooks/use-toast";

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => {
  const { markAsRead, clearNotification } = useNotifications();
  const { toast } = useToast();

  const getIcon = () => {
    switch (notification.type) {
      case "advisor":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case "order":
        return <Package className="h-5 w-5 text-orange-500" />;
      case "recommendation":
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBadgeText = () => {
    switch (notification.type) {
      case "advisor":
        return "Advisor";
      case "order":
        return "Order";
      case "recommendation":
        return "Recommendation";
      default:
        return "Notification";
    }
  };

  const getBadgeVariant = () => {
    switch (notification.type) {
      case "advisor":
        return "secondary";
      case "order":
        return "default";
      case "recommendation":
        return "outline";
      default:
        return "default";
    }
  };

  const handleAction = () => {
    markAsRead(notification.id);
    
    if (notification.type === "order") {
      toast({
        title: "Order Approved",
        description: "Your order has been approved and will be delivered as scheduled.",
      });
    } else if (notification.type === "recommendation") {
      toast({
        title: "Plan Created",
        description: "A new treatment plan has been added to your tasks.",
      });
    } else {
      toast({
        title: "Message Read",
        description: "Your message has been marked as read.",
      });
    }
  };

  const handleDismiss = () => {
    clearNotification(notification.id);
    toast({
      title: "Notification Dismissed",
      description: "The notification has been removed from your list.",
    });
  };

  return (
    <Card className={`w-full mb-4 transition-all ${!notification.read ? "border-l-4 border-l-agrifirm-green" : ""}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <CardTitle className="text-sm font-medium">{notification.title}</CardTitle>
        </div>
        <Badge variant={getBadgeVariant()}>{getBadgeText()}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
        <CardDescription className="pt-2">
          {format(notification.date, "MMM d, h:mm a")}
        </CardDescription>
      </CardContent>
      {(notification.actionRequired || !notification.read) && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleDismiss}>
            Dismiss
          </Button>
          {notification.actionRequired && (
            <Button size="sm" onClick={handleAction}>
              {notification.actionText || "Acknowledge"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default NotificationCard;
