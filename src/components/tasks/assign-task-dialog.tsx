"use client";

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
import { useState, useEffect } from "react";
import { Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface User {
  _id: string;
  email: string;
  languages?: string[];
}

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onAssign: (userId: string) => Promise<void>;
  taskName: string;
  taskLanguages?: string[];
  isReviewAssignment?: boolean;
}

export function AssignTaskDialog({
  open,
  onOpenChange,
  users,
  onAssign,
  taskName,
  taskLanguages = [],
  isReviewAssignment = false,
}: AssignTaskDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Filter users based on language capabilities
  useEffect(() => {
    if (!taskLanguages || taskLanguages.length === 0) {
      setFilteredUsers(users);
      return;
    }

    // Filter users who have all required languages
    const filtered = users.filter((user) => {
      if (!user.languages || user.languages.length === 0) return false;
      return taskLanguages.every((lang) => user.languages?.includes(lang));
    });

    setFilteredUsers(filtered);
  }, [users, taskLanguages]);

  const handleAssign = async () => {
    if (!selectedUserId) return;

    setIsAssigning(true);
    try {
      await onAssign(selectedUserId);
      onOpenChange(false);
      setSelectedUserId("");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReviewAssignment ? "Assign Task for Review" : "Assign Task"}
          </DialogTitle>
          <DialogDescription>
            {isReviewAssignment
              ? "Select a qualified user to review the task"
              : `Select a qualified user to assign the task: ${taskName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Language Requirements */}
          {taskLanguages.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Languages className="h-4 w-4 mt-0.5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Required Languages</p>
                <div className="flex flex-wrap gap-2">
                  {taskLanguages.map((lang) => (
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
          )}

          {/* User Selection */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Select User</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a qualified user" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedUserId("");
            }}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedUserId || isAssigning}
          >
            {isAssigning ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
