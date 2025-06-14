"use client";

import {
  CalendarDays,
  MoreVertical,
  CheckCircle,
  User,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { format } from "date-fns";
import type { Task } from "@/types/type";
import { AssignTaskDialog } from "./assign-task-dialog";
import { BulkAssignDialog } from "./bulk-assign-dialog";
import { BulkUnassignDialog } from "./bulk-unassign-dialog";
import Link from "next/link";

interface TaskListProps {
  tasks: Task[];
  users: { _id: string; email: string }[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  onAssign: (taskId: string, userId: string) => Promise<void>;
  onBulkAssign?: (taskIds: string[], userId: string) => Promise<void>;
  onBulkUnassign?: (taskIds: string[]) => Promise<void>;
}

export function TaskList({
  tasks,
  users,
  onEdit,
  onDelete,
  onStatusChange,
  onAssign,
  onBulkAssign,
  onBulkUnassign,
}: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
  const [showBulkUnassignDialog, setShowBulkUnassignDialog] = useState(false);

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteDialog(true);
  };

  const handleAssign = (task: Task) => {
    setSelectedTask(task);
    setShowAssignDialog(true);
  };

  const confirmDelete = () => {
    if (selectedTask) {
      onDelete(selectedTask._id);
      setShowDeleteDialog(false);
      setSelectedTask(null);
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (selectedTask) {
      await onAssign(selectedTask._id, userId);
      setShowAssignDialog(false);
      setSelectedTask(null);
    }
  };

  const handleBulkAssign = async (taskIds: string[], userId: string) => {
    if (onBulkAssign) {
      await onBulkAssign(taskIds, userId);
    }
  };

  const handleBulkUnassign = async (taskIds: string[]) => {
    if (onBulkUnassign) {
      await onBulkUnassign(taskIds);
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "text-green-600 dark:text-green-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "high":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // Get unassigned and assigned tasks
  const unassignedTasks = tasks.filter((task) => !task.assignedTo);
  const assignedTasks = tasks.filter((task) => task.assignedTo);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {/* Bulk Assign Button - Only show if there are unassigned tasks */}
          {unassignedTasks.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkAssignDialog(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Bulk Assign ({unassignedTasks.length})
            </Button>
          )}

          {/* Bulk Unassign Button - Only show if there are assigned tasks */}
          {onBulkUnassign && assignedTasks.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkUnassignDialog(true)}
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Bulk Unassign ({assignedTasks.length})
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>
                  <Link href={`/agent/projects/tasks/${task._id}`}>
                    <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium hover:underline">
                          {task.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {task.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status.replace("_", " ")}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {task.assignedTo
                      ? users.find((u) => u._id === task.assignedTo)?.email ||
                        "Unknown"
                      : "Unassigned"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {task?.dueDate && format(task.dueDate, "MMM d, yyyy")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAssign(task)}>
                        {task.assignedTo ? "Reassign Task" : "Assign Task"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onStatusChange(task._id, "pending")}
                        disabled={task.status === "pending"}
                      >
                        Mark as Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(task._id, "in_progress")}
                        disabled={task.status === "in_progress"}
                      >
                        Mark as In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(task._id, "review")}
                        disabled={task.status === "review"}
                      >
                        Mark as In Review
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(task._id, "completed")}
                        disabled={task.status === "completed"}
                      >
                        Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(task)}
                      >
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No tasks found. Create your first task.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedTask && (
        <AssignTaskDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          users={users}
          onAssign={handleAssignUser}
          taskName={selectedTask.name}
        />
      )}

      {/* Bulk Assign Dialog */}
      <BulkAssignDialog
        open={showBulkAssignDialog}
        onOpenChange={setShowBulkAssignDialog}
        users={users}
        tasks={unassignedTasks}
        onAssign={handleBulkAssign}
      />

      {/* Bulk Unassign Dialog */}
      {onBulkUnassign && (
        <BulkUnassignDialog
          open={showBulkUnassignDialog}
          onOpenChange={setShowBulkUnassignDialog}
          tasks={assignedTasks}
          onUnassign={handleBulkUnassign}
        />
      )}
    </>
  );
}
