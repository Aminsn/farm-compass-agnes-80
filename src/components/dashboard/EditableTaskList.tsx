
import React, { useState } from "react";
import { Check, Clock, AlertTriangle, Plus, Trash2, Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskContext, Task } from "@/context/TaskContext";
import { format } from "date-fns";

const EditableTaskList = () => {
  const { tasks, addTask, deleteTask, updateTask, completeTask } = useTaskContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending" as Task["status"],
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      addTask({
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        date: newTask.date
      });
      
      // Reset form and close dialog
      setNewTask({
        title: "",
        description: "",
        status: "pending",
        date: new Date().toISOString().split('T')[0]
      });
      setIsAddDialogOpen(false);
    }
  };
  
  const handleEditTask = () => {
    if (editingTask && editingTask.title.trim()) {
      updateTask(editingTask);
      setIsEditDialogOpen(false);
      setEditingTask(null);
    }
  };
  
  const openEditDialog = (task: Task) => {
    setEditingTask({...task});
    setIsEditDialogOpen(true);
  };

  const toggleTaskStatus = (id: string) => {
    completeTask(id);
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-agrifirm-black">Today's Tasks</h2>
        <Button 
          variant="outline"
          size="sm"
          className="text-agrifirm-green border-agrifirm-green hover:bg-agrifirm-light-green/20"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>
      
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
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-agrifirm-grey hover:text-agrifirm-green hover:bg-agrifirm-light-green/20"
                  onClick={() => openEditDialog(task)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-agrifirm-grey hover:text-red-500 hover:bg-red-50"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="farm-card bg-agrifirm-light-yellow-2/50 text-center">
          <p>No tasks scheduled for today</p>
        </div>
      )}

      {upcomingTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-agrifirm-black mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            {upcomingTasks.map(task => (
              <div key={task.id} className="farm-card">
                <div className="flex justify-between">
                  <h3 className="font-medium text-agrifirm-black">{task.title}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-agrifirm-grey hover:text-agrifirm-green hover:bg-agrifirm-light-green/20"
                        onClick={() => openEditDialog(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-agrifirm-grey hover:text-red-500 hover:bg-red-50"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-agrifirm-grey mt-1">{task.description}</p>
                <p className="text-xs text-agrifirm-brown-dark mt-2">
                  {format(new Date(task.date), 'EEEE, MMMM d, yyyy')}
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
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-agrifirm-grey hover:text-agrifirm-green hover:bg-agrifirm-light-green/20"
                        onClick={() => openEditDialog(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-agrifirm-grey hover:text-red-500 hover:bg-red-50"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-agrifirm-grey mt-1">{task.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-red-500">
                    Due: {format(new Date(task.date), 'MMM d, yyyy')}
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
      
      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Enter task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-date">Due Date</Label>
                <Input
                  id="task-date"
                  type="date"
                  value={newTask.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({...newTask, status: value as Task["status"]})}
                >
                  <SelectTrigger id="task-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="bg-agrifirm-green hover:bg-agrifirm-green/90">
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-task-title">Task Title</Label>
                <Input
                  id="edit-task-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  placeholder="Enter task title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-description">Description</Label>
                <Textarea
                  id="edit-task-description"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-task-date">Due Date</Label>
                  <Input
                    id="edit-task-date"
                    type="date"
                    value={editingTask.date}
                    onChange={(e) => setEditingTask({...editingTask, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-task-status">Status</Label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value) => setEditingTask({...editingTask, status: value as Task["status"]})}
                  >
                    <SelectTrigger id="edit-task-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask} className="bg-agrifirm-green hover:bg-agrifirm-green/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditableTaskList;
