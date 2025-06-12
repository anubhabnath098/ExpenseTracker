"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CreditCard, ShoppingBag, Utensils, Car, Film, Home } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const categoryIcons = {
  "Food & Dining": Utensils,
  Shopping: ShoppingBag,
  Transportation: Car,
  Entertainment: Film,
  Utilities: Home,
  Other: CreditCard,
}

interface Expense {
  id: string
  date: Date
  category: keyof typeof categoryIcons
  description: string
  amount: number
}

export function RecentExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchRecentExpenses = async () => {
    const user_id = localStorage.getItem('user_id')
    if (!user_id) return

    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/expense/recent/${user_id}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to fetch recent expenses')
      
      const data = await response.json()
      const formattedExpenses = data.map((item: any) => ({
        id: item.id,
        date: new Date(item.date),
        category: item.category as keyof typeof categoryIcons,
        description: item.description || "No description",
        amount: item.amount
      }))
      
      setExpenses(formattedExpenses)
    } catch (error) {
      console.error('Error fetching recent expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentExpenses()
  }, [])

  if (isLoading) {
    return (
      <Card className="border-purple-900/20 card-hover">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div>Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-900/20 card-hover">
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Your latest transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => {
            const Icon = categoryIcons[expense.category]

            return (
              <div key={expense.id} className="flex items-center">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center mr-4",
                    expense.category === "Food & Dining" && "bg-purple-900/20 text-purple-400",
                    expense.category === "Transportation" && "bg-blue-900/20 text-blue-400",
                    expense.category === "Entertainment" && "bg-pink-900/20 text-pink-400",
                    expense.category === "Shopping" && "bg-yellow-900/20 text-yellow-400",
                    expense.category === "Utilities" && "bg-green-900/20 text-green-400",
                    expense.category === "Other" && "bg-gray-900/20 text-gray-400",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{expense.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{expense.category}</span>
                    <span className="mx-1">•</span>
                    <span>{format(expense.date, "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">-${expense.amount.toFixed(2)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}