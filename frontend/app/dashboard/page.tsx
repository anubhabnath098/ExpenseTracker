import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { NotificationsList } from "@/components/dashboard/notifications-list"
import { RecentExpenses } from "@/components/dashboard/recent-expenses"
import { StatsCards } from "@/components/dashboard/stats-cards"

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your finances.</p>
      </div>

      <StatsCards />

      <ExpenseChart />

      <div className="grid gap-6 md:grid-cols-2">
        <BudgetProgress />
        <RecentExpenses />
      </div>

      <NotificationsList />
    </div>
  )
}

