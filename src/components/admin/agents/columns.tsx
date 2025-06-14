import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Building2,
  Shield,
  Users,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Agent } from "@/types/type";

interface ColumnsProps {
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => Promise<void>;
}

export const columns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<Agent>[] => [
  {
    accessorKey: "name",
    header: "Agent Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const description = row.original.description;

      return (
        <div className="flex items-start gap-3">
          <Building2 className="h-6 w-6 text-blue-500" />
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "active"
          ? "success"
          : status === "suspended"
          ? "destructive"
          : "outline";

      return (
        <Badge
          variant={variant}
          className="capitalize px-3 py-1 text-xs font-medium"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "adminIds",
    header: "Admins",
    cell: ({ row }) => {
      const count = (row.getValue("adminIds") as string[]).length;
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-blue-500" />
          {count} {count === 1 ? "admin" : "admins"}
        </div>
      );
    },
  },
  {
    accessorKey: "userIds",
    header: "Users",
    cell: ({ row }) => {
      const count = (row.getValue("userIds") as string[]).length;
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 text-blue-500" />
          {count} {count === 1 ? "user" : "users"}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: "Actions",
    cell: ({ row }) => {
      const agent = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(agent)}>
              Edit Agent
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                /* Implement Add Admin */
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                /* Implement Add User */
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                /* Implement Activate Agent */
              }}
            >
              Activate Agent
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(agent._id)}
            >
              Delete Agent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
