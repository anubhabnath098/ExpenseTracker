"use client"

import type * as React from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export function Chart({ title, description, className, ...props }: ChartProps) {
  return <div className={cn("space-y-3", className)} {...props} />
}

interface ChartContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

Chart.Content = function ChartContent({ children, className, ...props }: ChartContentProps) {
  return (
    <div className={cn("rounded-md border p-6", className)} {...props}>
      {children}
    </div>
  )
}

interface ChartHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

Chart.Header = function ChartHeader({ title, description, className, ...props }: ChartHeaderProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

export function ChartContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container", className)} {...props} />
}

export function ChartTooltip({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md border bg-background p-2 shadow-sm", className)} {...props} />
}

export function ChartTooltipContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid grid-cols-2 gap-2", className)} {...props} />
}

export function ChartLegend({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center space-x-2", className)} {...props} />
}

export function ChartLegendContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export function ChartStyle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <style {...props} />
}

Chart.ResponsiveContainer = ResponsiveContainer
Chart.ComposedChart = ComposedChart
Chart.PieChart = PieChart
Chart.Pie = Pie
Chart.Cell = Cell
Chart.Area = Area
Chart.Bar = Bar
Chart.Line = Line
Chart.XAxis = XAxis
Chart.YAxis = YAxis
Chart.CartesianGrid = CartesianGrid
Chart.Tooltip = Tooltip
Chart.Legend = Legend

