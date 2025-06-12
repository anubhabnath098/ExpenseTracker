"use client"

import { useState, useEffect } from "react"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, PiggyBank, Wallet } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string
  description: string
  extraDescription?: string
  icon: React.ReactNode
  trend: {
    value: number
    isPositive: boolean
    text: string
  }
}

function StatsCard({ title, value, description, extraDescription, icon, trend }: StatsCardProps) {
  return (
    <Card className="border-purple-900/20 card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-purple-900/20 flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="flex flex-col mt-1">
          <span>{description}</span>
          {extraDescription && <span className="text-xs text-muted-foreground">{extraDescription}</span>}
          <div className="flex items-center">
            {trend.isPositive ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={cn("text-xs", trend.isPositive ? "text-green-500" : "text-red-500")}>{trend.value}%</span>
            <span className="text-xs text-muted-foreground ml-1">{trend.text}</span>
          </div>
        </CardDescription>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const [stats, setStats] = useState({
    totalExpenses: { value: 0, trend: { value: 0, isPositive: true } },
    totalBudget: { value: 0, trend: { value: 0, isPositive: true } },
    remainingBudget: { value: 0, trend: { value: 0, isPositive: true } },
  })
  const [isLoading, setIsLoading] = useState(true)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchStats = async () => {
    const user_id = localStorage.getItem('user_id')
    if (!user_id) return

    try {
      setIsLoading(true)
      
      const [expensesRes, budgetRes, remainingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/expense/total/${user_id}`, { headers: getAuthHeaders() }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget/total/${user_id}`, { headers: getAuthHeaders() }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget/remaining/${user_id}`, { headers: getAuthHeaders() })
      ])

      if (!expensesRes.ok || !budgetRes.ok || !remainingRes.ok) throw new Error('Failed to fetch stats')

      const expensesData = await expensesRes.json()
      const budgetData = await budgetRes.json()
      const remainingData = await remainingRes.json()

      setStats({
        totalExpenses: {
          value: expensesData.totalExpenses,
          trend: expensesData.trend
        },
        totalBudget: {
          value: budgetData.totalBudget,
          trend: budgetData.trend
        },
        remainingBudget: {
          value: remainingData.remainingBudget,
          trend: remainingData.trend
        }
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardContent>Loading...</CardContent></Card>
        <Card><CardContent>Loading...</CardContent></Card>
        <Card><CardContent>Loading...</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Expenses"
        value={`$${stats.totalExpenses.value.toFixed(2)}`}
        description="Your total expenses this month"
        extraDescription="(excluding budget expenditure)"
        icon={<Wallet className="h-4 w-4 text-purple-500" />}
        trend={{
          value: stats.totalExpenses.trend.value,
          isPositive: stats.totalExpenses.trend.isPositive,
          text: "from last month",
        }}
      />
      <StatsCard
        title="Total Budget"
        value={`$${stats.totalBudget.value.toFixed(2)}`}
        description="Your total budget this month"
        icon={<PiggyBank className="h-4 w-4 text-purple-500" />}
        trend={{
          value: stats.totalBudget.trend.value,
          isPositive: stats.totalBudget.trend.isPositive,
          text: "from last month",
        }}
      />
      <StatsCard
        title="Remaining Budget"
        value={`$${stats.remainingBudget.value.toFixed(2)}`}
        description="Your remaining budget this month"
        icon={<DollarSign className="h-4 w-4 text-purple-500" />}
        trend={{
          value: stats.remainingBudget.trend.value,
          isPositive: stats.remainingBudget.trend.isPositive,
          text: "from last month",
        }}
      />
    </div>
  )
}