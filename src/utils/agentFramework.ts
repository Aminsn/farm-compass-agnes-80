
// This file creates an agentic framework for handling farming operations
import { CalendarEvent, useEvents } from "@/context/EventContext";
import { Task, useTaskContext } from "@/context/TaskContext";
import { extractEventFromMessage } from "./eventParser";

// Agent actions for different operations
export type AgentAction = 
  | { type: "ADD_EVENT"; event: Omit<CalendarEvent, "id"> }
  | { type: "DELETE_EVENT"; id: string }
  | { type: "UPDATE_EVENT"; event: CalendarEvent }
  | { type: "ADD_TASK"; task: Omit<Task, "id"> }
  | { type: "DELETE_TASK"; id: string }
  | { type: "UPDATE_TASK"; task: Task }
  | { type: "COMPLETE_TASK"; id: string }
  | { type: "GET_TASKS" }
  | { type: "GET_EVENTS" };

// Parse message to detect what actions to take
export const parseAgentActions = (message: string): AgentAction[] => {
  const actions: AgentAction[] = [];
  const lowerMessage = message.toLowerCase();
  
  // Check for calendar event operations
  const possibleEvent = extractEventFromMessage(message);
  if (possibleEvent) {
    actions.push({
      type: "ADD_EVENT",
      event: possibleEvent
    });
  }
  
  // Check for task operations
  if (
    lowerMessage.includes("add task") || 
    lowerMessage.includes("create task") ||
    lowerMessage.includes("new task")
  ) {
    // Extract task details
    const titleMatch = message.match(/task(?:\s+called|\s+named|\s+titled|\s+for)?\s+["']?([^"']+)["']?/i);
    const dateMatch = message.match(/(today|tomorrow|next \w+|on [^,\.]+)/i);
    const statusMatch = lowerMessage.includes("urgent") ? "urgent" : "pending";
    
    if (titleMatch && titleMatch[1]) {
      actions.push({
        type: "ADD_TASK",
        task: {
          title: titleMatch[1].trim(),
          description: "",
          status: statusMatch as "pending" | "completed" | "urgent",
          date: dateMatch ? extractDateFromText(dateMatch[1]) : new Date().toISOString().split('T')[0]
        }
      });
    }
  }
  
  if (
    lowerMessage.includes("complete task") || 
    lowerMessage.includes("finish task") ||
    lowerMessage.includes("mark task as done") ||
    lowerMessage.includes("task completed")
  ) {
    const titleMatch = message.match(/task(?:\s+called|\s+named|\s+titled|\s+for)?\s+["']?([^"']+)["']?/i);
    if (titleMatch && titleMatch[1]) {
      actions.push({
        type: "COMPLETE_TASK",
        id: titleMatch[1].trim() // We'll use title as identifier in the executor
      });
    }
  }
  
  if (
    lowerMessage.includes("delete task") || 
    lowerMessage.includes("remove task")
  ) {
    const titleMatch = message.match(/task(?:\s+called|\s+named|\s+titled|\s+for)?\s+["']?([^"']+)["']?/i);
    if (titleMatch && titleMatch[1]) {
      actions.push({
        type: "DELETE_TASK",
        id: titleMatch[1].trim() // We'll use title as identifier in the executor
      });
    }
  }
  
  // List operations
  if (lowerMessage.includes("list tasks") || lowerMessage.includes("show tasks")) {
    actions.push({ type: "GET_TASKS" });
  }
  
  if (lowerMessage.includes("list events") || lowerMessage.includes("show events")) {
    actions.push({ type: "GET_EVENTS" });
  }
  
  return actions;
};

// Helper function to extract date from text descriptions
const extractDateFromText = (dateText: string): string => {
  const today = new Date();
  const lowerDateText = dateText.toLowerCase();
  
  if (lowerDateText.includes("today")) {
    return today.toISOString().split('T')[0];
  }
  
  if (lowerDateText.includes("tomorrow")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  if (lowerDateText.includes("next monday")) {
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
    return nextMonday.toISOString().split('T')[0];
  }
  
  // Add other date parsing logic as needed
  
  // Default to today
  return today.toISOString().split('T')[0];
};

// Hook to execute agent actions
export const useAgentExecutor = () => {
  const { events, addEvent, deleteEvent, updateEvent } = useEvents();
  const { tasks, addTask, deleteTask, updateTask, completeTask } = useTaskContext();
  
  const executeActions = (actions: AgentAction[]): string[] => {
    const results: string[] = [];
    
    for (const action of actions) {
      switch (action.type) {
        case "ADD_EVENT": {
          const id = addEvent(action.event);
          results.push(`Added event "${action.event.title}" to calendar on ${new Date(action.event.date).toLocaleDateString()}`);
          break;
        }
        case "DELETE_EVENT": {
          deleteEvent(action.id);
          results.push(`Deleted event from calendar`);
          break;
        }
        case "UPDATE_EVENT": {
          updateEvent(action.event);
          results.push(`Updated event "${action.event.title}" in calendar`);
          break;
        }
        case "ADD_TASK": {
          const id = addTask(action.task);
          results.push(`Added task "${action.task.title}" to your task list`);
          break;
        }
        case "DELETE_TASK": {
          // Find task by title or ID
          const taskToDelete = tasks.find(t => 
            t.id === action.id || t.title.toLowerCase() === action.id.toLowerCase()
          );
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            results.push(`Deleted task "${taskToDelete.title}" from your task list`);
          } else {
            results.push(`Couldn't find a task matching "${action.id}"`);
          }
          break;
        }
        case "UPDATE_TASK": {
          updateTask(action.task);
          results.push(`Updated task "${action.task.title}" in your task list`);
          break;
        }
        case "COMPLETE_TASK": {
          // Find task by title or ID
          const taskToComplete = tasks.find(t => 
            t.id === action.id || t.title.toLowerCase() === action.id.toLowerCase()
          );
          if (taskToComplete) {
            completeTask(taskToComplete.id);
            results.push(`Marked task "${taskToComplete.title}" as complete`);
          } else {
            results.push(`Couldn't find a task matching "${action.id}"`);
          }
          break;
        }
        case "GET_TASKS": {
          const taskSummary = tasks.map(t => `- ${t.title} (${t.status})`).join('\n');
          results.push(`Your current tasks:\n${taskSummary}`);
          break;
        }
        case "GET_EVENTS": {
          const eventSummary = events.map(e => `- ${e.title} (${new Date(e.date).toLocaleDateString()})`).join('\n');
          results.push(`Your upcoming events:\n${eventSummary}`);
          break;
        }
      }
    }
    
    return results;
  };
  
  return { executeActions };
};
