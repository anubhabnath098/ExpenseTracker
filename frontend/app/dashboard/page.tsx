import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { NotificationsList } from "@/components/dashboard/notifications-list"
import { RecentExpenses } from "@/components/dashboard/recent-expenses"
import { StatsCards } from "@/components/dashboard/stats-cards"

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in grid-pattern">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-purple-400">Dashboard</h1>
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

