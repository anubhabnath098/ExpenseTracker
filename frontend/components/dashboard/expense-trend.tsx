"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartTooltipContent } from "@/components/ui/chart"

export function MonthlyTrendChart() {
  const [monthlyData, setMonthlyData] = useState<{ name: string; amount: number }[]>([])
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
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/expense/monthly/${user_id}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to fetch monthly expenses')
      
      const data = await response.json()
      // Map 'expenses' to 'amount' to match chart dataKey
      const formattedData = data.map((item: { name: string; expenses: number }) => ({
        name: item.name,
        amount: item.expenses
      }))
      setMonthlyData(formattedData)
    } catch (error) {
      console.error('Error fetching monthly expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthlyExpenses()
  }, [])

  if (isLoading) {
    return (
      <Card className="border-purple-900/20 card-hover">
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Your expense trend over time</CardDescription>
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
        <CardTitle>Monthly Trend</CardTitle>
        <CardDescription>Your expense trend over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart>
          <Chart.Content>
            <Chart.ResponsiveContainer width="100%" height={300}>
              <Chart.ComposedChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
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
                <ChartTooltipContent />
                <Chart.Bar dataKey="amount" fill="#9333ea" radius={[4, 4, 0, 0]} />
                <Chart.Line type="monotone" dataKey="amount" stroke="#c084fc" strokeWidth={2} dot={{ r: 4 }} />
              </Chart.ComposedChart>
            </Chart.ResponsiveContainer>
          </Chart.Content>
        </Chart>
      </CardContent>
    </Card>
  )
}