"use client"

import { useState, useEffect } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface BudgetCategory {
  name: string
  spent: number
  total: number
  color: string
}

export function BudgetProgress() {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const colors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-yellow-500"
  ]

  // Define percentage color classes based on spending levels
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 100) return "text-red-600"    // Over budget
    if (percentage >= 80) return "text-orange-500"  // 80-99%
    if (percentage >= 60) return "text-yellow-500"  // 60-79%
    if (percentage >= 40) return "text-lime-500"    // 40-59%
    return "text-green-500"                         // 0-39%
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchBudgetSummary = async () => {
    const user_id = localStorage.getItem('user_id')
    if (!user_id) return

    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget/summary/${user_id}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to fetch budget summary')
      
      const data = await response.json()
      const formattedCategories = data.map((item: any, index: number) => ({
        name: item.name,
        spent: item.spent,
        total: item.total,
        color: colors[index % colors.length]
      }))
      
      setBudgetCategories(formattedCategories)
    } catch (error) {
      console.error('Error fetching budget summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgetSummary()
  }, [])

  if (isLoading) {
    return (
      <Card className="border-purple-900/20 card-hover">
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>Track your spending against budget categories</CardDescription>
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
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>Track your spending against budget categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetCategories.map((category) => {
            const percentage = Math.min(Math.round((category.spent / category.total) * 100), 100)
            const isOverBudget = category.spent > category.total
            const percentageColor = getPercentageColor(percentage)

            return (
              <div key={category.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className={isOverBudget ? "text-red-400" : ""}>
                    ${category.spent} / ${category.total}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={percentage}
                    className={`h-2 ${isOverBudget ? "bg-red-950" : "bg-muted"}`}
                    indicatorClassName={isOverBudget ? "bg-red-500" : category.color}
                  />
                  <span className={`text-xs font-medium w-10 text-right ${percentageColor}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}