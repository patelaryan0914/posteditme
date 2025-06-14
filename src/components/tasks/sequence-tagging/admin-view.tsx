"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Task } from "@/types/type";
import { TaggedText } from "./tagged-text";

interface AdminViewProps {
  tasks: Task[];
  onDownloadResults: () => void;
}

export function AdminView({ tasks, onDownloadResults }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">(
    "all"
  );

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");

  const getTasksByTab = () => {
    switch (activeTab) {
      case "pending":
        return [...pendingTasks, ...inProgressTasks];
      case "completed":
        return completedTasks;
      default:
        return tasks;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks in this project
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingTasks.length + inProgressTasks.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks pending or in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sequence Tagging Tasks</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              View and manage sequence tagging tasks
            </p>
          </div>
          <Button onClick={onDownloadResults}>
            <Download className="h-4 w-4 mr-2" />
            Download Results
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="pending">
                In Progress ({pendingTasks.length + inProgressTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedTasks.length})
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {getTasksByTab().map((task) => (
                <div key={task._id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                        {task.assignedTo && (
                          <Badge variant="outline">Assigned</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {format(task.updatedAt, "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="font-medium">Due</p>
                      <p className="text-muted-foreground">
                        {format(task.dueDate, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Text</h4>
                      <TaggedText
                        text={task.sequenceTaggingData?.text || ""}
                        tags={task.sequenceTaggingData?.tags || []}
                        isInteractive={false}
                      />
                    </div>

                    {task.sequenceTaggingData?.notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.sequenceTaggingData.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {getTasksByTab().length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tasks found</p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
