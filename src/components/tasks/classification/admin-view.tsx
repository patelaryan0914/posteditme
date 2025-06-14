"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import type { Task } from "@/types/type";

interface AdminViewProps {
  tasks: Task[];
  onDownloadResults: () => void;
}

export function AdminView({ tasks, onDownloadResults }: AdminViewProps) {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate label distribution
  const labelDistribution = tasks.reduce((acc, task) => {
    if (
      task.status === "completed" &&
      task.classificationData?.selectedLabels
    ) {
      task.classificationData.selectedLabels.forEach((label) => {
        acc[label] = (acc[label] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <Progress value={progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(progress)}% of total tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((inProgressTasks / totalTasks) * 100)}% of total tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((pendingTasks / totalTasks) * 100)}% of total tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Label Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Label Distribution</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Distribution of assigned labels across completed tasks
              </p>
            </div>
            <Button variant="outline" onClick={onDownloadResults}>
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(labelDistribution).map(([label, count]) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {count} tasks ({Math.round((count / completedTasks) * 100)}
                    %)
                  </span>
                </div>
                <Progress value={(count / completedTasks) * 100} />
              </div>
            ))}
            {Object.keys(labelDistribution).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No classification data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Classifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Classifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks
              .filter((task) => task.status === "completed")
              .sort(
                (a, b) =>
                  (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)
              )
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task._id}
                  className="flex items-start justify-between p-4 rounded-lg border"
                >
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="font-medium">{task.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {task?.classificationData?.text?.slice(0, 100)}...
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {task?.classificationData?.selectedLabels?.map(
                        (label) => (
                          <Badge key={label} variant="secondary">
                            {label}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {task?.updatedAt && format(task.updatedAt, "MMM d, h:mm a")}
                  </div>
                </div>
              ))}
            {tasks.filter((task) => task.status === "completed").length ===
              0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No completed classifications yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
