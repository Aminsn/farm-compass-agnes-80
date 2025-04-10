import React from "react";
import { Check, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Task type definition
type Task = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed" | "urgent";
  date: string;
};

// Sample tasks data - Advisor-specific tasks
const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Review Soil Test Results",
    description: "Analyze soil test results for the Johnson farm and prepare recommendations",
    status: "urgent",
    date: "2025-04-10"
  },
  {
    id: "2",
    title: "Create Crop Rotation Plan",
    description: "Develop a 3-year crop rotation plan for Williams farm",
    status: "pending",
    date: "2025-04-10"
  },
  {
    id: "3",
    title: "Submit Quarterly Reports",
    description: "Complete and submit quarterly performance reports for all client farms",
    status: "completed",
    date: "2025-04-09"
  },
  {
    id: "4",
    title: "Prepare Fertilizer Recommendations",
    description: "Create custom fertilizer application plans for spring planting",
    status: "pending",
    date: "2025-04-11"
  },
  {
    id: "5",
    title: "Schedule Client Follow-ups",
    description: "Contact clients with upcoming planting seasons to schedule consultations",
    status: "pending",
    date: "2025-04-10"
  }
];

const TaskList = () => {
  const [tasks, setTasks] = React.useState<Task[]>(sampleTasks);

  const toggleTaskStatus = (id: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id 
          ? { 
              ...task, 
              status: task.status === "completed" ? "pending" : "completed" 
            } 
          : task
      )
    );
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-agrifirm-green" />;
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-agrifirm-yellow" />;
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.date === today);
  const upcomingTasks = tasks.filter(task => task.date > today);
  const pastTasks = tasks.filter(task => task.date < today && task.status !== "completed");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-agrifirm-black mb-4">Today's Tasks</h2>
        {todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.map(task => (
              <div 
                key={task.id}
                className={`farm-card flex items-start gap-3 ${
                  task.status === "completed" ? "bg-agrifirm-light-green/10" : 
                  task.status === "urgent" ? "bg-red-50" : "bg-white"
                }`}
              >
                <button 
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-1 flex-shrink-0 h-5 w-5 rounded border ${
                    task.status === "completed" 
                      ? "bg-agrifirm-green border-agrifirm-green text-white" 
                      : "border-agrifirm-grey bg-white"
                  }`}
                >
                  {task.status === "completed" && <Check className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className={`font-medium ${task.status === "completed" ? "line-through text-agrifirm-grey" : "text-agrifirm-black"}`}>
                      {task.title}
                    </h3>
                    {task.status !== "completed" && getStatusIcon(task.status)}
                  </div>
                  <p className="text-sm text-agrifirm-grey mt-1">{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="farm-card bg-agrifirm-light-yellow-2/50 text-center">
            <p>No tasks scheduled for today</p>
          </div>
        )}
      </div>

      {upcomingTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-agrifirm-black mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            {upcomingTasks.map(task => (
              <div key={task.id} className="farm-card">
                <div className="flex justify-between">
                  <h3 className="font-medium text-agrifirm-black">{task.title}</h3>
                  {getStatusIcon(task.status)}
                </div>
                <p className="text-sm text-agrifirm-grey mt-1">{task.description}</p>
                <p className="text-xs text-agrifirm-brown-dark mt-2">
                  {new Date(task.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pastTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-red-500 mb-4">Overdue Tasks</h2>
          <div className="space-y-3">
            {pastTasks.map(task => (
              <div key={task.id} className="farm-card bg-red-50 border-red-100">
                <div className="flex justify-between">
                  <h3 className="font-medium text-agrifirm-black">{task.title}</h3>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-sm text-agrifirm-grey mt-1">{task.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-red-500">
                    Due: {new Date(task.date).toLocaleDateString()}
                  </p>
                  <Button 
                    onClick={() => toggleTaskStatus(task.id)}
                    variant="outline" 
                    size="sm"
                    className="text-xs bg-white hover:bg-agrifirm-light-green/20 border-agrifirm-green text-agrifirm-green"
                  >
                    Mark Complete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
