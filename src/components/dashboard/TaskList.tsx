
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
  viewType?: "farmer" | "advisor";
};

// Sample tasks data for farmers
const farmerTasks: Task[] = [
  {
    id: "1",
    title: "Apply Fertilizer",
    description: "Apply nitrogen fertilizer to the corn field in the north section",
    status: "urgent",
    date: "2025-04-10",
    viewType: "farmer"
  },
  {
    id: "2",
    title: "Check Irrigation System",
    description: "Inspect and clean irrigation nozzles in the soybean field",
    status: "pending",
    date: "2025-04-10",
    viewType: "farmer"
  },
  {
    id: "3",
    title: "Harvest Winter Wheat",
    description: "Begin harvesting winter wheat in the east field",
    status: "completed",
    date: "2025-04-09",
    viewType: "farmer"
  },
  {
    id: "4",
    title: "Repair Barn Door",
    description: "Fix the loose hinge on the north barn door",
    status: "pending",
    date: "2025-04-11",
    viewType: "farmer"
  },
  {
    id: "5",
    title: "Seed Planting",
    description: "Prepare seed drill for spring planting of barley",
    status: "pending",
    date: "2025-04-10",
    viewType: "farmer"
  }
];

// Sample tasks data for advisors
const advisorTasks: Task[] = [
  {
    id: "a1",
    title: "Review Farm Reports",
    description: "Review monthly performance reports for your assigned farms",
    status: "urgent",
    date: "2025-04-10",
    viewType: "advisor"
  },
  {
    id: "a2",
    title: "Prepare Client Presentations",
    description: "Finalize slides for the quarterly client review meetings",
    status: "pending",
    date: "2025-04-10",
    viewType: "advisor"
  },
  {
    id: "a3",
    title: "Schedule Farm Visits",
    description: "Coordinate visits to Green Valley and Blue Ridge farms",
    status: "completed",
    date: "2025-04-09",
    viewType: "advisor"
  },
  {
    id: "a4",
    title: "Equipment Training",
    description: "Complete online training for new soil testing equipment",
    status: "pending",
    date: "2025-04-11",
    viewType: "advisor"
  },
  {
    id: "a5",
    title: "Update Client Database",
    description: "Add the new crop rotation information to client profiles",
    status: "pending",
    date: "2025-04-10",
    viewType: "advisor"
  }
];

const TaskList = () => {
  // Determine if we're in the advisor view
  const isAdvisorView = window.location.pathname.includes("/advisor");
  const initialTasks = isAdvisorView ? advisorTasks : farmerTasks;
  
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);

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
        <h2 className="text-xl font-semibold text-agrifirm-black mb-4">
          {isAdvisorView ? "Today's Advisory Tasks" : "Today's Farm Tasks"}
        </h2>
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
            <p>
              {isAdvisorView 
                ? "No advisory tasks scheduled for today" 
                : "No farm tasks scheduled for today"}
            </p>
          </div>
        )}
      </div>

      {upcomingTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-agrifirm-black mb-4">
            {isAdvisorView ? "Upcoming Advisory Work" : "Upcoming Field Work"}
          </h2>
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
          <h2 className="text-xl font-semibold text-red-500 mb-4">
            {isAdvisorView ? "Overdue Advisory Tasks" : "Overdue Farm Tasks"}
          </h2>
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
