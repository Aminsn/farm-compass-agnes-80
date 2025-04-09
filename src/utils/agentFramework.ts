
import { useEvents } from "@/context/EventContext";
import { useTaskContext } from "@/context/TaskContext";
import { useToast } from "@/hooks/use-toast";
import { format, parse, isValid } from "date-fns";

// Define action types for our agent
export type AgentAction = {
  type: string;
  parameters: Record<string, any>;
};

// Function to parse potential agent actions from user messages
export function parseAgentActions(message: string): AgentAction[] {
  const actions: AgentAction[] = [];
  
  // Look for task creation patterns
  if (/add (a )?task|create (a )?task|new task/i.test(message)) {
    const titleMatch = message.match(/task (for|to|called|named|about|on) ([^,.]+)/i);
    const dateMatch = message.match(/(tomorrow|today|next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|on ([a-z]+ \d+))/i);
    
    if (titleMatch) {
      const title = titleMatch[2].trim();
      let date = new Date().toISOString().split('T')[0]; // Default to today
      
      if (dateMatch) {
        if (dateMatch[0].toLowerCase().includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          date = tomorrow.toISOString().split('T')[0];
        } else if (dateMatch[0].toLowerCase().includes('next')) {
          const dayOfWeek = dateMatch[0].toLowerCase().split(' ')[1];
          date = getNextDayOfWeek(dayOfWeek).toISOString().split('T')[0];
        }
      }
      
      actions.push({
        type: 'ADD_TASK',
        parameters: {
          title,
          date,
          description: "",
          status: message.toLowerCase().includes('urgent') ? 'urgent' : 'pending'
        }
      });
    }
  }
  
  // Look for task completion patterns
  if (/mark (the )?(task|"[^"]+"|\S+) (as )?complete|complete (the )?(task|"[^"]+"|\S+)/i.test(message)) {
    const taskMatch = message.match(/mark (the )?(task|"([^"]+)"|\S+)|complete (the )?(task|"([^"]+)"|\S+)/i);
    if (taskMatch) {
      // Extract task name from quotes if present, otherwise use the word after task
      let taskTitle = "";
      if (taskMatch[3]) {
        taskTitle = taskMatch[3];
      } else if (taskMatch[6]) {
        taskTitle = taskMatch[6];
      } else {
        const wordsAfterTaskOrComplete = message
          .replace(/mark (the )?(task|"[^"]+"|\S+) (as )?complete|complete (the )?(task|"[^"]+"|\S+)/i, '')
          .trim()
          .split(' ')[0];
        taskTitle = wordsAfterTaskOrComplete;
      }
      
      actions.push({
        type: 'COMPLETE_TASK',
        parameters: {
          taskTitle
        }
      });
    }
  }
  
  // Look for task deletion patterns
  if (/delete (the )?(task|"[^"]+"|\S+)|remove (the )?(task|"[^"]+"|\S+)/i.test(message)) {
    const taskMatch = message.match(/delete (the )?(task|"([^"]+)"|\S+)|remove (the )?(task|"([^"]+)"|\S+)/i);
    if (taskMatch) {
      // Extract task name from quotes if present, otherwise use the word after task
      let taskTitle = "";
      if (taskMatch[3]) {
        taskTitle = taskMatch[3];
      } else if (taskMatch[6]) {
        taskTitle = taskMatch[6];
      } else {
        const wordsAfterTaskOrDelete = message
          .replace(/delete (the )?(task|"[^"]+"|\S+)|remove (the )?(task|"[^"]+"|\S+)/i, '')
          .trim()
          .split(' ')[0];
        taskTitle = wordsAfterTaskOrDelete;
      }
      
      actions.push({
        type: 'DELETE_TASK',
        parameters: {
          taskTitle
        }
      });
    }
  }
  
  // Look for list tasks pattern
  if (/show( me)? (my|all|the|current) tasks|list( all| my)? tasks|what( are my| are the)? tasks/i.test(message)) {
    actions.push({
      type: 'LIST_TASKS',
      parameters: {}
    });
  }
  
  // Look for calendar event patterns (these are more complex and might need refinement)
  if (/schedule|add (an |a )?event|create (an |a )?event|add to( my)? calendar/i.test(message)) {
    const titleMatch = message.match(/schedule ([^,.]+)|add (?:an |a )?event ([^,.]+)|create (?:an |a )?event ([^,.]+)/i);
    const dateMatch = message.match(/(tomorrow|today|next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|on ([a-z]+ \d+))/i);
    
    let title = "";
    if (titleMatch) {
      title = (titleMatch[1] || titleMatch[2] || titleMatch[3] || "").trim();
    }
    
    let date = new Date().toISOString().split('T')[0]; // Default to today
    
    if (dateMatch) {
      if (dateMatch[0].toLowerCase().includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        date = tomorrow.toISOString().split('T')[0];
      } else if (dateMatch[0].toLowerCase().includes('next')) {
        const dayOfWeek = dateMatch[0].toLowerCase().split(' ')[1];
        date = getNextDayOfWeek(dayOfWeek).toISOString().split('T')[0];
      }
    }
    
    // Try to determine the event type
    let eventType: "planting" | "irrigation" | "fertilizing" | "harvesting" | "maintenance" | "other" = "other";
    
    if (/plant|seeding|sowing/i.test(message)) {
      eventType = "planting";
    } else if (/irrigat|water/i.test(message)) {
      eventType = "irrigation";
    } else if (/fertiliz|nutrient/i.test(message)) {
      eventType = "fertilizing";
    } else if (/harvest|collect|gather/i.test(message)) {
      eventType = "harvesting";
    } else if (/maintenance|repair|check|inspect/i.test(message)) {
      eventType = "maintenance";
    }
    
    if (title) {
      actions.push({
        type: 'ADD_EVENT',
        parameters: {
          title,
          date: new Date(date),
          type: eventType,
          description: ""
        }
      });
    }
  }
  
  // Look for event deletion patterns
  if (/delete (the )?(event|"[^"]+"|\S+) from calendar|remove (the )?(event|"[^"]+"|\S+) from calendar|cancel (the )?(event|"[^"]+"|\S+)/i.test(message)) {
    const eventMatch = message.match(/delete (the )?(event|"([^"]+)"|\S+)|remove (the )?(event|"([^"]+)"|\S+)|cancel (the )?(event|"([^"]+)"|\S+)/i);
    if (eventMatch) {
      // Extract event name from quotes if present, otherwise use the word after event
      let eventTitle = "";
      if (eventMatch[3]) {
        eventTitle = eventMatch[3];
      } else if (eventMatch[6]) {
        eventTitle = eventMatch[6];
      } else if (eventMatch[9]) {
        eventTitle = eventMatch[9];
      } else {
        const wordsAfterEventOrDelete = message
          .replace(/delete (the )?(event|"[^"]+"|\S+)|remove (the )?(event|"[^"]+"|\S+)|cancel (the )?(event|"[^"]+"|\S+)/i, '')
          .trim()
          .split(' ')[0];
        eventTitle = wordsAfterEventOrDelete;
      }
      
      actions.push({
        type: 'DELETE_EVENT',
        parameters: {
          eventTitle
        }
      });
    }
  }
  
  return actions;
}

// Helper function to get the next occurrence of a specific day of the week
function getNextDayOfWeek(dayName: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  const targetDay = days.indexOf(dayName.toLowerCase());
  
  if (targetDay < 0) return today; // Invalid day name, return today
  
  const todayDay = today.getDay();
  let daysUntilNext = targetDay - todayDay;
  
  if (daysUntilNext <= 0) {
    daysUntilNext += 7; // If the target day is today or earlier this week, get next week's occurrence
  }
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntilNext);
  
  return nextDate;
}

// Custom hook to execute agent actions
export function useAgentExecutor() {
  const { addTask, deleteTask, completeTask, tasks } = useTaskContext();
  const { addEvent, deleteEvent, events } = useEvents();
  const { toast } = useToast();
  
  // Function to execute actions
  const executeActions = (actions: AgentAction[]): string[] => {
    const results: string[] = [];
    
    actions.forEach(action => {
      try {
        switch (action.type) {
          case 'ADD_TASK': {
            const { title, description, date, status } = action.parameters;
            const taskId = addTask({
              title,
              description,
              date,
              status
            });
            results.push(`✅ Added task "${title}" for ${format(new Date(date), 'MMMM d, yyyy')}.`);
            toast({
              title: "Task Added",
              description: `"${title}" has been added to your tasks.`,
            });
            break;
          }
          
          case 'COMPLETE_TASK': {
            const { taskTitle } = action.parameters;
            // Find the task by partial title match
            const task = tasks.find(t => 
              t.title.toLowerCase().includes(taskTitle.toLowerCase()) && 
              t.status !== 'completed'
            );
            
            if (task) {
              completeTask(task.id);
              results.push(`✅ Marked task "${task.title}" as complete.`);
              toast({
                title: "Task Completed",
                description: `"${task.title}" has been marked as complete.`,
              });
            } else {
              results.push(`❌ Could not find an active task matching "${taskTitle}".`);
            }
            break;
          }
          
          case 'DELETE_TASK': {
            const { taskTitle } = action.parameters;
            // Find the task by partial title match
            const task = tasks.find(t => 
              t.title.toLowerCase().includes(taskTitle.toLowerCase())
            );
            
            if (task) {
              deleteTask(task.id);
              results.push(`✅ Deleted task "${task.title}".`);
              toast({
                title: "Task Deleted",
                description: `"${task.title}" has been deleted.`,
              });
            } else {
              results.push(`❌ Could not find a task matching "${taskTitle}".`);
            }
            break;
          }
          
          case 'LIST_TASKS': {
            if (tasks.length === 0) {
              results.push("You don't have any tasks scheduled.");
            } else {
              const today = new Date().toISOString().split('T')[0];
              const todayTasks = tasks.filter(task => task.date === today);
              const upcomingTasks = tasks.filter(task => task.date > today);
              const pendingTasks = tasks.filter(task => task.status !== 'completed');
              
              let taskList = "Your current tasks:\n";
              
              if (todayTasks.length > 0) {
                taskList += "\nToday:\n";
                todayTasks.forEach(task => {
                  taskList += `- ${task.title} (${task.status})\n`;
                });
              }
              
              if (upcomingTasks.length > 0) {
                taskList += "\nUpcoming:\n";
                upcomingTasks.forEach(task => {
                  taskList += `- ${task.title} (${format(new Date(task.date), 'MMM d')})\n`;
                });
              }
              
              results.push(taskList);
            }
            break;
          }
          
          case 'ADD_EVENT': {
            const { title, date, type, description } = action.parameters;
            const eventId = addEvent({
              title,
              date,
              type,
              description
            });
            results.push(`✅ Added "${title}" to your calendar on ${format(date, 'MMMM d, yyyy')}.`);
            toast({
              title: "Event Added",
              description: `"${title}" has been added to your calendar.`,
            });
            break;
          }
          
          case 'DELETE_EVENT': {
            const { eventTitle } = action.parameters;
            // Find the event by partial title match
            const event = events.find(e => 
              e.title.toLowerCase().includes(eventTitle.toLowerCase())
            );
            
            if (event) {
              deleteEvent(event.id);
              results.push(`✅ Removed "${event.title}" from your calendar.`);
              toast({
                title: "Event Deleted",
                description: `"${event.title}" has been removed from your calendar.`,
              });
            } else {
              results.push(`❌ Could not find an event matching "${eventTitle}".`);
            }
            break;
          }
          
          default:
            results.push(`Unknown action: ${action.type}`);
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
        results.push(`Failed to execute ${action.type}: ${(error as Error).message}`);
      }
    });
    
    return results;
  };
  
  return { executeActions };
}
