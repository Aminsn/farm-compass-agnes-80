
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define task type 
export type Task = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed" | "urgent";
  date: string;
  viewType?: "farmer" | "advisor";
};

// Sample task data
const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Check Corn Field Irrigation",
    description: "Ensure irrigation system is working properly in the north corn field",
    status: "pending",
    date: "2025-04-09",
    viewType: "farmer"
  },
  {
    id: "2",
    title: "Apply Fertilizer to Wheat Field",
    description: "Use the nitrogen-rich fertilizer on the eastern wheat field",
    status: "urgent",
    date: "2025-04-09",
    viewType: "farmer"
  },
  {
    id: "3",
    title: "Repair Tractor",
    description: "Schedule maintenance for the John Deere tractor",
    status: "completed",
    date: "2025-04-08",
    viewType: "farmer"
  },
  {
    id: "4",
    title: "Order New Seeds",
    description: "Place order for next season's soybean seeds",
    status: "pending",
    date: "2025-04-10",
    viewType: "farmer"
  },
  {
    id: "5",
    title: "Review Farm Reports",
    description: "Analyze monthly performance reports for all client farms",
    status: "urgent",
    date: "2025-04-14",
    viewType: "advisor"
  },
  {
    id: "6",
    title: "Prepare Client Presentations",
    description: "Create slides for quarterly review meetings",
    status: "pending",
    date: "2025-04-15",
    viewType: "advisor"
  },
  {
    id: "7",
    title: "Schedule Farm Visits",
    description: "Arrange site visits to three client farms",
    status: "pending",
    date: "2025-04-16",
    viewType: "advisor"
  },
  {
    id: "8",
    title: "Attend Agricultural Conference",
    description: "Participate in the annual agricultural technology conference",
    status: "pending",
    date: "2025-04-20",
    viewType: "advisor"
  }
];

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => string;
  deleteTask: (id: string) => void;
  updateTask: (task: Task) => void;
  completeTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);

  const addTask = (taskData: Omit<Task, "id">) => {
    const id = Date.now().toString();
    const newTask = { ...taskData, id };
    setTasks(prev => [...prev, newTask]);
    return id;
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
  };
  
  const completeTask = (id: string) => {
    setTasks(prev => 
      prev.map(task => task.id === id ? { ...task, status: "completed" } : task)
    );
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, deleteTask, updateTask, completeTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
