"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Task } from "@/types/type";

const TASK_COUNT_OPTIONS = [5, 10, 15, 50, 100, 200, 500, 1000];

interface User {
  _id: string;
  email: string;
  languages?: string[];
}

interface BulkAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  tasks: Task[];
  onAssign: (taskIds: string[], userId: string) => Promise<void>;
}

export function BulkAssignDialog({
  open,
  onOpenChange,
  users,
  tasks,
  onAssign,
}: BulkAssignDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [taskCount, setTaskCount] = useState<number | "all">("all");
  const [showWarning, setShowWarning] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  // Get required languages from tasks
  // const getRequiredLanguages = () => {
  //   if (tasks.length === 0 || !tasks[0].project) return [];

  //   const firstTask = tasks[0];
  //   const languages = [
  //     firstTask?.project?.sourceLanguage,
  //     firstTask?.project?.targetLanguage
  //   ].filter(Boolean) as string[];
  //   const uniqueLanguages = languages.filter((lang, index, self) =>
  //     self.indexOf(lang) === index
  //   );
  //   return uniqueLanguages;
  // };

  // const requiredLanguages = getRequiredLanguages();

  // Filter users based on language capabilities
  // useEffect(() => {
  //   if (tasks.length === 0 || requiredLanguages.length === 0) {
  //     setFilteredUsers(users);
  //     return;
  //   }

  //   // Filter users who have all required languages
  //   const filtered = users.filter(user => {
  //     if (!user.languages || user.languages.length === 0) return false;
  //     return requiredLanguages.every(lang => user.languages?.includes(lang));
  //   });

  //   setFilteredUsers(filtered);
  // }, [tasks, users, requiredLanguages]);
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);
  // Initialize selected tasks
  useEffect(() => {
    if (taskCount === "all") {
      setSelectedTasks(tasks.map((task) => task._id));
    } else {
      setSelectedTasks(tasks.slice(0, taskCount).map((task) => task._id));
    }
  }, [taskCount, tasks]);

  const handleAssign = async () => {
    if (!selectedUserId || selectedTasks.length === 0) return;

    setIsAssigning(true);
    try {
      await onAssign(selectedTasks, selectedUserId);
      onOpenChange(false);
      setSelectedTasks([]);
      setSelectedUserId("");
      setTaskCount("all");
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
    setTaskCount("all");
  };

  const toggleAllTasks = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
      setTaskCount("all");
    } else {
      setSelectedTasks(tasks.map((task) => task._id));
      setTaskCount("all");
    }
  };

  // Show warning for large task counts
  useEffect(() => {
    setShowWarning(selectedTasks.length > 100);
  }, [selectedTasks.length]);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setSelectedTasks([]);
          setSelectedUserId("");
          setTaskCount("all");
          setShowWarning(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Assign Tasks</DialogTitle>
          <DialogDescription>
            Select tasks and assign them to a qualified user
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            {/* Language Requirements */}
            {/* {requiredLanguages.length > 0 && (
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <Languages className="h-4 w-4 mt-0.5 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Required Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {requiredLanguages.map(lang => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only showing users who can work with these languages
                  </p>
                </div>
              </div>
            )} */}

            {/* User Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a qualified user" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user, index) => (
                    <SelectItem key={index} value={user._id}>
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        {user.languages && (
                          <span className="text-xs text-muted-foreground">
                            Languages: {user.languages.join(", ")}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filteredUsers.length === 0 && (
                <p className="text-sm text-destructive">
                  No users found with the required language capabilities
                </p>
              )}
            </div>

            {/* Task Count Selection */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Number of Tasks</label>
              <Select
                value={taskCount.toString()}
                onValueChange={(value) =>
                  setTaskCount(value === "all" ? "all" : parseInt(value))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select number of tasks" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_COUNT_OPTIONS.map(
                    (count) =>
                      count <= tasks.length && (
                        <SelectItem key={count} value={count.toString()}>
                          {count} Tasks
                        </SelectItem>
                      )
                  )}
                  <SelectItem value="all">
                    All Tasks ({tasks.length})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showWarning && (
              <div className="flex items-center gap-2 p-3 text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 rounded-md">
                <AlertTriangle className="h-4 w-4" />
                <p>
                  Assigning a large number of tasks may take some time to
                  process
                </p>
              </div>
            )}

            {/* Task Selection */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Select Tasks</label>
                <p className="text-sm text-muted-foreground">
                  {selectedTasks.length} task
                  {selectedTasks.length !== 1 ? "s" : ""} selected
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleAllTasks}>
                {selectedTasks.length === tasks.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <label
                    key={task._id}
                    className="flex items-start space-x-3 space-y-0"
                  >
                    <Checkbox
                      checked={selectedTasks.includes(task._id)}
                      onCheckedChange={() => toggleTask(task._id)}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                          {task.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          (Task {index + 1})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              !selectedUserId || selectedTasks.length === 0 || isAssigning
            }
            className="min-w-[150px]"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign ${selectedTasks.length} Task${
                selectedTasks.length !== 1 ? "s" : ""
              }`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
