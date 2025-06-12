"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { AlertCircle, Bell } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Notification {
  id: string
  message: string
  type: "warning" | "info"
  isRead: boolean
  notifiedAt: Date
  budgetName: string | null
}



export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const token = localStorage.getItem("token")
    const fetchNotifications = async () => {
      try {

        if (!userId || !token) {
          throw new Error("User ID or token not found in localStorage")
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget/notifications/recent/${userId}`,
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
          throw new Error(errorData.error || "Failed to fetch notifications")
        }

        const data = await response.json()
        // Map API response to Notification interface
        const formattedNotifications: Notification[] = data.notifications.map((notif: any) => ({
          id: notif.id,
          message: notif.message,
          type: notif.type as "warning" | "info",
          isRead: notif.isRead,
          notifiedAt: new Date(notif.notifiedAt),
          budgetName: notif.budgetName,
        }))

        setNotifications(formattedNotifications)
      } catch (err: any) {
        toast.error("Error fetching notifications:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  return (
    <Card className="border-purple-900/20 card-hover">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2 text-purple-400" />
          Notifications
        </CardTitle>
        <CardDescription>Stay updated with your budget</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications available.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg border flex items-start",
                  notification.isRead ? "border-purple-900/10 bg-purple-900/5" : "border-purple-500/20 bg-purple-900/10",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0",
                    notification.type === "warning" ? "bg-red-900/20 text-red-400" : "bg-blue-900/20 text-blue-400",
                  )}
                >
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !notification.isRead && "font-medium")}>
                    {notification.message}
                    {notification.budgetName && ` (${notification.budgetName})`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(notification.notifiedAt, "MMM d, h:mm a")}
                  </p>
                </div>
                {!notification.isRead && <div className="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}