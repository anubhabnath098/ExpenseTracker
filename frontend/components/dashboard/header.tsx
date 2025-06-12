"use client"

import { useState, useEffect, type ReactNode } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell } from "lucide-react"
import {toast} from 'sonner'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  children?: ReactNode
}

interface Notification {
  id: string
  message: string
  notifiedAt: Date
  budgetName: string | null
}

export function Header({ children }: HeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem("user_id")
      const token = localStorage.getItem("token")

      if (!userId || !token) {
        toast.error("User ID or token not found in localStorage")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget/notifications/unread/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to fetch notifications")
      }

      const data = await response.json()
      const formattedNotifications: Notification[] = data.notifications.map((notif: any) => ({
        id: notif.id,
        message: notif.message,
        notifiedAt: new Date(notif.notifiedAt),
        budgetName: notif.budgetName,
      }))

      setNotifications(formattedNotifications)
    } catch (err: any) {
      toast.error("Error fetching notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const userId = localStorage.getItem("user_id")
      const token = localStorage.getItem("token")

      if (!userId || !token) {
        toast.error("User ID or token not found in localStorage")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget/notifications/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notification_id: notificationId, user_id: userId }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to mark notification as read")
      }else{
        setNotifications(notifications.filter((n) => n.id !== notificationId))
        toast.info('Marked notification as read');
      }

      
    } catch (err: any) {
      toast.error("Error marking notification as read:", err)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <header className="border-b border-purple-900/20 p-4 flex items-center justify-between">
      <div className="flex items-center">{children}</div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-400">{error}</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                  <div className="flex justify-between w-full">
                    <span className="font-medium">
                      {notification.message}
                      {notification.budgetName && ` (${notification.budgetName})`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-purple-400"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(notification.notifiedAt, { addSuffix: true })}
                  </span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">No unread notifications</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}