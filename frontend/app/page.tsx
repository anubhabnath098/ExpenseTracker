import Link from "next/link"
import { DollarSign } from "lucide-react"

import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-purple-900/20 p-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-purple-500" />
            <h1 className="text-xl font-bold ml-2 gradient-text">ExpenseTracker</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 dashboard-gradient">
        <div className="container flex flex-col lg:flex-row items-center justify-between gap-12 py-12">
          <div className="lg:w-1/2 space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Take Control of Your Finances</h1>
            <p className="text-xl text-muted-foreground">
              Track expenses, set budgets, and gain insights into your spending habits with our powerful expense
              tracker.
            </p>
            <ul className="space-y-2">
              {[
                "Easy expense tracking and categorization",
                "Create and manage budgets for different categories",
                "Visualize your spending with beautiful charts",
                "Get notifications when you're approaching budget limits",
                "Generate detailed reports of your financial activity",
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2 w-full max-w-md">
            <AuthForm />
          </div>
        </div>
      </main>

      <footer className="border-t border-purple-900/20 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ExpenseTracker. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
