"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserProfile, UserRole } from "@/types/roles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2 } from "lucide-react"

export type UsersTableProps = {
  currentUserId: string
  onDeleteUser: (uid: string, displayName: string) => void
  deletingUser: string | null
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive' as const
    case 'leader':
      return 'default' as const
    default:
      return 'secondary' as const
  }
}

export const createColumns = ({
  currentUserId,
  onDeleteUser,
  deletingUser,
}: UsersTableProps): ColumnDef<UserProfile>[] => [
  {
    accessorKey: "uid",
    header: "ID",
    cell: ({ row }) => {
      return (
        <span className="text-xs font-mono text-gray-600">{row.original.uid}</span>
      )
    },
  },
  {
    accessorKey: "displayName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div>
          <div className="font-medium">{user.displayName || 'No name'}</div>
          {user.uid === currentUserId && (
            <span className="text-xs text-gray-500">(You)</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.email
      return email ? email : <span className="text-gray-400">-</span>
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.original.role
      return (
        <Badge variant={getRoleBadgeVariant(role)} className="text-sm">
          {role.toUpperCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.original.createdAt
      if (!date) return <span className="text-gray-400">-</span>

      try {
        const dateObj = new Date(date)
        if (isNaN(dateObj.getTime())) {
          return <span className="text-gray-400">-</span>
        }
        return (
          <span className="text-sm">
            {dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )
      } catch {
        return <span className="text-gray-400">-</span>
      }
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original
      const isCurrentUser = user.uid === currentUserId
      const isDeleting = deletingUser === user.uid

      if (isCurrentUser) {
        return null
      }

      return (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDeleteUser(user.uid, user.displayName || user.phoneNumber)}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    },
  },
]
