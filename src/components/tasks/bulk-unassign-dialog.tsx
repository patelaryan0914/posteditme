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
import { Task } from "@/types/type";
import { Badge } from "@/components/ui/badge";

const TASK_COUNT_OPTIONS = [5, 10, 15, 50, 100, 200, 500, 1000];

interface BulkUnassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  onUnassign: (taskIds: string[]) => Promise<void>;
}

export function BulkUnassignDialog({
  open,
  onOpenChange,
  tasks,
  onUnassign,
}: BulkUnassignDialogProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [taskCount, setTaskCount] = useState<number | "all">("all");
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (taskCount === "all") {
      setSelectedTasks(tasks.map((task) => task._id));
    } else {
      setSelectedTasks(tasks.slice(0, taskCount).map((task) => task._id));
    }
  }, [taskCount, tasks]);

  const handleUnassign = async () => {
    if (selectedTasks.length === 0) return;

    setIsUnassigning(true);
    try {
      await onUnassign(selectedTasks);
      onOpenChange(false);
    } finally {
      setIsUnassigning(false);
      setSelectedTasks([]);
      setTaskCount("all");
    }
  };

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
    // Reset taskCount when manually selecting tasks
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
          setTaskCount("all");
          setShowWarning(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Unassign Tasks</DialogTitle>
          <DialogDescription>
            Select tasks to unassign from their current assignees
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
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
                  {TASK_COUNT_OPTIONS.map((count) => (
                    <SelectItem
                      key={count}
                      value={count.toString()}
                      disabled={count > tasks.length}
                    >
                      {count} Tasks
                    </SelectItem>
                  ))}
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
                  Unassigning a large number of tasks may take some time to
                  process
                </p>
              </div>
            )}

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

            <div className="flex flex-wrap gap-2 mb-4">
              {TASK_COUNT_OPTIONS.map(
                (count) =>
                  count <= tasks.length && (
                    <Badge
                      key={count}
                      variant={
                        selectedTasks.length === count ? "default" : "outline"
                      }
                      className="cursor-pointer hover:bg-primary/90 transition-colors"
                      onClick={() => {
                        setTaskCount(count);
                        setSelectedTasks(
                          tasks.slice(0, count).map((task) => task._id)
                        );
                      }}
                    >
                      {count} Tasks
                    </Badge>
                  )
              )}
              <Badge
                variant={
                  selectedTasks.length === tasks.length ? "default" : "outline"
                }
                className="cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => {
                  setTaskCount("all");
                  setSelectedTasks(tasks.map((task) => task._id));
                }}
              >
                All Tasks ({tasks.length})
              </Badge>
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
            disabled={isUnassigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnassign}
            disabled={selectedTasks.length === 0 || isUnassigning}
            className="min-w-[150px]"
          >
            {isUnassigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unassigning...
              </>
            ) : (
              `Unassign ${selectedTasks.length} Task${
                selectedTasks.length !== 1 ? "s" : ""
              }`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
