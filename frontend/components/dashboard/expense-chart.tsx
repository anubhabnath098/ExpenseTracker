"use client"

import { useState, useEffect } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartTooltip } from "@/components/ui/chart"

const COLORS = ["#9333ea", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff", "#f3e8ff"]

export function ExpenseChart() {
  const [monthlyData, setMonthlyData] = useState<{ name: string; expenses: number }[]>([])
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchMonthlyExpenses = async () => {
    const user_id = localStorage.getItem('user_id')
    if (!user_id) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/expense/monthly/${user_id}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to fetch monthly expenses')
      
      const data = await response.json()
      setMonthlyData(data)
    } catch (error) {
      console.error('Error fetching monthly expenses:', error)
    }
  }

  const fetchCategoryExpenses = async () => {
    const user_id = localStorage.getItem('user_id')
    if (!user_id) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/expense/categories/${user_id}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to fetch category expenses')
      
      const data = await response.json()
      setCategoryData(data)
    } catch (error) {
      console.error('Error fetching category expenses:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([fetchMonthlyExpenses(), fetchCategoryExpenses()])
      setIsLoading(false)
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-purple-900/20 card-hover">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
            <CardDescription>Your expense trend over the past year</CardDescription>
          </CardHeader>
          <CardContent>
            <div>Loading...</div>
          </CardContent>
        </Card>
        <Card className="border-purple-900/20 card-hover">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Breakdown of your expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div>Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-purple-900/20 card-hover">
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>Your expense trend over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart>
            <Chart.Content>
              <Chart.ResponsiveContainer width="100%" height={300}>
                <Chart.ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <Chart.CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Chart.XAxis
                    dataKey="name"
                    tick={{ fill: "#a1a1aa" }}
                    axisLine={{ stroke: "#27272a" }}
                    tickLine={{ stroke: "#27272a" }}
                  />
                  <Chart.YAxis
                    tick={{ fill: "#a1a1aa" }}
                    axisLine={{ stroke: "#27272a" }}
                    tickLine={{ stroke: "#27272a" }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip />
                  <Chart.Area
                    type="monotone"
                    dataKey="expenses"
                    fill="url(#colorExpenses)"
                    stroke="#9333ea"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </Chart.ComposedChart>
              </Chart.ResponsiveContainer>
            </Chart.Content>
          </Chart>
        </CardContent>
      </Card>

      <Card className="border-purple-900/20 card-hover">
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <CardDescription>Breakdown of your expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart>
            <Chart.Content>
              <Chart.ResponsiveContainer width="100%" height={300}>
                <Chart.PieChart>
                  <Chart.Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Chart.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Chart.Pie>
                  <ChartTooltip formatter={(value) => `$${value}`} />
                </Chart.PieChart>
              </Chart.ResponsiveContainer>
            </Chart.Content>
          </Chart>
        </CardContent>
      </Card>
    </div>
  )
}