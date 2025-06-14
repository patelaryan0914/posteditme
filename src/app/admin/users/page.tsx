"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Agent, UserData } from "@/types/type";
import {
  Loader2,
  Shield,
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { trpc } from "@/app/_trpc/client";
import { Header } from "@/components/dashboard/header";
import { useAuth } from "@/lib/auth-context";
interface FilterOptions {
  role?: string;
  status?: string;
  approved?: boolean;
}

export default function UsersPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [filterAgents, setFilterAgents] = useState<Agent[] | []>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showRemoveAdminDialog, setShowRemoveAdminDialog] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  const {
    data: userData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = trpc.auth.getAll.useQuery();
  const {
    data: agentsData,
    isLoading: agentsLoading,
    refetch: refetchAgents,
  } = trpc.agent.getAll.useQuery();
  const removeAdmin = trpc.agent.removeAdmin.useMutation();
  const approveUser = trpc.auth.approveUser.useMutation();
  const deleteUser = trpc.auth.deleteUser.useMutation();
  const suspendUser = trpc.auth.suspendUser.useMutation();
  const addAdmin = trpc.agent.addAdmin.useMutation();

  const handleDelete = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleSuspend = (user: UserData) => {
    setSelectedUser(user);
    setShowSuspendDialog(true);
  };

  const handleAddAdmin = (user: UserData) => {
    setSelectedUser(user);
    setSelectedAgentId("");
    setShowAddAdminDialog(true);
  };

  const handleRemoveAdmin = (user: UserData) => {
    setSelectedUser(user);
    setSelectedAgentId("");
    setFilterAgents(
      agentsData?.agents?.filter((agent) => {
        const isAdmin = agent.adminIds.some(
          (admin: UserData) =>
            admin._id === user?._id && admin.email === user.email
        );
        return isAdmin;
      }) || []
    );
    setShowRemoveAdminDialog(true);
  };

  const handleExportUsers = () => {
    const csvContent = [
      ["Email", "Role", "Status", "Approved", "Created At"],
      filteredUsers?.length == 0
        ? []
        : filteredUsers?.map((user: UserData) => [
            user.email,
            user.role,
            user.status,
            user.approved ? "Yes" : "No",
            format(new Date(user.createdAt!), "yyyy-MM-dd HH:mm:ss"),
          ]),
    ]
      .map((row) => row?.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredUsers = userData?.users.filter((user: UserData) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status && user.status !== filters.status) return false;
    if (filters.approved !== undefined && user.approved !== filters.approved)
      return false;
    return true;
  });

  if (usersLoading || agentsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header email={user?.email || ""} isSystemAdmin={true} />
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">User Management</h2>
            <p className="text-muted-foreground mt-2">
              Manage user accounts and permissions
            </p>
          </div>
          <Button onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-md border p-4">
          <h3 className="mb-4 text-lg font-medium">Filters</h3>
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-48">
              <Select
                value={filters.role || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    role: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="agent_admin">Agent Admin</SelectItem>
                  <SelectItem value="system_admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={
                  filters.approved === undefined
                    ? "all"
                    : filters.approved.toString()
                }
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    approved: value === "all" ? undefined : value === "true",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by approval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Approved</SelectItem>
                  <SelectItem value="false">Not Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="ml-auto"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.role === "system_admin" ? (
                        <Shield className="h-4 w-4 text-destructive" />
                      ) : user.role === "agent_admin" ? (
                        <Building2 className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      )}
                      {user.role === "system_admin"
                        ? "System Admin"
                        : user.role === "agent_admin"
                        ? "Agent Admin"
                        : "User"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.status === "suspended" ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      ) : user.approved ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      {user.status === "suspended"
                        ? "Suspended"
                        : user.approved
                        ? "Approved"
                        : "Pending"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role !== "system_admin" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await approveUser.mutateAsync({
                                  userId: user._id!,
                                  approved: !user.approved,
                                });
                                refetchUsers();
                                toast.success("User approved successfully");
                                refetchUsers();
                              } catch (error) {
                                toast.error("Failed to approve user");
                                console.error(error);
                              }
                            }}
                          >
                            {user.approved ? "Revoke Approval" : "Approve User"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSuspend(user)}>
                            {user.status === "suspended"
                              ? "Reactivate User"
                              : "Suspend User"}
                          </DropdownMenuItem>
                          {user.role === "agent_admin" ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleRemoveAdmin(user)}
                              >
                                Remove Admin Role
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleAddAdmin(user)}
                            >
                              Make Agent Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(user)}
                          >
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No users found matching the selected filters
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
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This action cannot be
                undone. All associated data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await deleteUser.mutateAsync({
                      userId: selectedUser?._id!,
                    });
                    toast.success("User deleted successfully");
                    refetchUsers();
                  } catch (error) {
                    toast.error("Failed to delete user");
                    console.error(error);
                  }
                }}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Suspend/Reactivate Dialog */}
        <AlertDialog
          open={showSuspendDialog}
          onOpenChange={setShowSuspendDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedUser?.status === "suspended"
                  ? "Reactivate User"
                  : "Suspend User"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser?.status === "suspended"
                  ? "Are you sure you want to reactivate this user?"
                  : "Are you sure you want to suspend this user? They will not be able to access the system."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await suspendUser.mutateAsync({
                      userId: selectedUser?._id!,
                      status: "suspended",
                    });
                    toast.success("User suspended successfully");
                    refetchUsers();
                  } catch (error) {
                    toast.error("Failed to suspend user");
                    console.error(error);
                  }
                }}
              >
                {selectedUser?.status === "suspended"
                  ? "Reactivate"
                  : "Suspend"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Role Change Dialog */}
        <AlertDialog
          open={showAddAdminDialog}
          onOpenChange={setShowAddAdminDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedUser?.role === "agent_admin"
                  ? "Change Agent"
                  : "Make Agent Admin"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser?.role === "agent_admin"
                  ? "Select a different agent for this admin"
                  : "Select an agent to assign this user as an administrator"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Select Agent</label>
                <Select
                  value={selectedAgentId}
                  onValueChange={setSelectedAgentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agentsData?.agents?.map((agent, index) => (
                      <SelectItem key={index} value={String(agent._id)}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!selectedUser || !selectedAgentId) {
                    toast.error("Please select an agent");
                    return;
                  }
                  addAdmin.mutate({
                    agentId: selectedAgentId,
                    userId: selectedUser._id,
                  });
                  toast.success("User added as admin successfully");
                  refetchUsers();
                  refetchAgents();
                }}
                disabled={!selectedAgentId}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog
          open={showRemoveAdminDialog}
          onOpenChange={setShowRemoveAdminDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedUser?.role === "agent_admin"
                  ? "Change Agent"
                  : "Make Agent Admin"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser?.role === "agent_admin"
                  ? "Select a different agent for this admin"
                  : "Select an agent to assign this user as an administrator"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Select Agent</label>
                <Select
                  value={selectedAgentId}
                  onValueChange={setSelectedAgentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterAgents?.map((agent, index) => (
                      <SelectItem key={index} value={String(agent._id)}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!selectedUser || !selectedAgentId) {
                    toast.error("Please select an agent");
                    return;
                  }
                  removeAdmin.mutate({
                    agentId: selectedAgentId,
                    userId: selectedUser._id,
                  });
                  toast.success("User removed as admin successfully");
                  refetchUsers();
                  refetchAgents();
                }}
                disabled={!selectedAgentId}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
