"use client";

import {
  Building2,
  Users,
  MoreVertical,
  UserPlus,
  Shield,
  UserMinus,
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
import { useState } from "react";
import type { Agent } from "@/types/type";

interface AgentListProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (agentId: string) => void;
  onStatusChange: (agentId: string, newStatus: "active" | "inactive") => void;
  onAddAdmin: (agentId: string, userId: string) => Promise<void>;
  onRemoveAdmin: (agentId: string, userId: string) => Promise<void>;
  onAddUser: (agentId: string, userId: string) => Promise<void>;
  onRemoveUser: (agentId: string, userId: string) => Promise<void>;
  availableUsers: { _id: string; email: string }[];
  availableAdmins: { _id: string; email: string }[];
}

export function AgentList({
  agents,
  onEdit,
  onDelete,
  onStatusChange,
  onAddAdmin,
  onRemoveAdmin,
  onAddUser,
  onRemoveUser,
  availableUsers,
  availableAdmins,
}: AgentListProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showRemoveAdminDialog, setShowRemoveAdminDialog] = useState(false);
  const [showRemoveUserDialog, setShowRemoveUserDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const handleDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedAgent) {
      onDelete(selectedAgent._id);
      setShowDeleteDialog(false);
      setSelectedAgent(null);
    }
  };

  const handleStatusChange = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowStatusDialog(true);
  };

  const confirmStatusChange = () => {
    if (selectedAgent) {
      onStatusChange(
        selectedAgent._id,
        selectedAgent.status === "active" ? "inactive" : "active"
      );
      setShowStatusDialog(false);
      setSelectedAgent(null);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedAgent || !selectedUserId) return;

    setProcessing(true);
    try {
      await onAddAdmin(selectedAgent._id as string, selectedUserId);
      setShowAddAdminDialog(false);
      setSelectedUserId("");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!selectedAgent || !selectedUserId) return;

    setProcessing(true);
    try {
      await onRemoveAdmin(selectedAgent._id as string, selectedUserId);
      setShowRemoveAdminDialog(false);
      setSelectedUserId("");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedAgent || !selectedUserId) return;

    setProcessing(true);
    try {
      await onAddUser(selectedAgent._id as string, selectedUserId);
      setShowAddUserDialog(false);
      setSelectedUserId("");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!selectedAgent || !selectedUserId) return;

    setProcessing(true);
    try {
      await onRemoveUser(selectedAgent._id as string, selectedUserId);
      setShowRemoveUserDialog(false);
      setSelectedUserId("");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admins</TableHead>
              <TableHead>Users</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agent.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      agent.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {agent.status}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>{agent.adminIds?.length || 0} admins</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{agent.userIds?.length || 0} users</span>
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
                      <DropdownMenuItem onClick={() => onEdit(agent)}>
                        Edit Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowAddAdminDialog(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Admin
                      </DropdownMenuItem>
                      {agent.adminIds?.length > 0 && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowRemoveAdminDialog(true);
                          }}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowAddUserDialog(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </DropdownMenuItem>
                      {agent.userIds?.length > 0 && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowRemoveUserDialog(true);
                          }}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove User
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(agent)}
                      >
                        {agent.status === "active" ? "Deactivate" : "Activate"}{" "}
                        Agent
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(agent)}
                      >
                        Delete Agent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {agents.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No agents found. Create your first translation agent.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this agent? This action cannot be
              undone. All associated data will be permanently removed.
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

      {/* Status Change Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAgent?.status === "active" ? "Deactivate" : "Activate"}{" "}
              Agent
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAgent?.status === "active"
                ? "Are you sure you want to deactivate this agent? They will not be able to accept new projects."
                : "Are you sure you want to activate this agent? They will be able to accept new projects."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              {selectedAgent?.status === "active" ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
            <DialogDescription>
              Add a new admin to {selectedAgent?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {availableAdmins.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddAdminDialog(false);
                setSelectedUserId("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAdmin}
              disabled={!selectedUserId || processing}
            >
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Admin Dialog */}
      <Dialog
        open={showRemoveAdminDialog}
        onOpenChange={setShowRemoveAdminDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Admin</DialogTitle>
            <DialogDescription>
              Remove an admin from {selectedAgent?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Admin to Remove
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an admin" />
                </SelectTrigger>
                <SelectContent>
                  {selectedAgent?.adminIds?.map((adminId) => {
                    return (
                      <SelectItem key={adminId._id} value={adminId._id}>
                        {adminId.email}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRemoveAdminDialog(false);
                setSelectedUserId("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveAdmin}
              disabled={!selectedUserId || processing}
            >
              Remove Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Add a new user to {selectedAgent?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddUserDialog(false);
                setSelectedUserId("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!selectedUserId || processing}
            >
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove User Dialog */}
      <Dialog
        open={showRemoveUserDialog}
        onOpenChange={setShowRemoveUserDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Remove a user from {selectedAgent?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select User to Remove
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {selectedAgent?.userIds?.map((userId) => {
                    return (
                      <SelectItem key={userId._id} value={userId._id}>
                        {userId.email}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRemoveUserDialog(false);
                setSelectedUserId("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveUser}
              disabled={!selectedUserId || processing}
            >
              Remove User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
