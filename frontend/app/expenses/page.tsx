"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ChevronDown, CreditCard, Filter, Plus, Search, Trash2, Utensils, ShoppingBag, Car, Film, Home } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartTooltipContent } from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger, 
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { MonthlyTrendChart } from "@/components/dashboard/expense-trend"
import {toast} from 'sonner'

const categoryIcons = {
  "Food & Dining": Utensils,
  Shopping: ShoppingBag,
  Transportation: Car,
  Entertainment: Film,
  Utilities: Home,
  Other: CreditCard,
}

const categoryId = {
  "Food & Dining": "et_1",
  Shopping: "et_4",
  Transportation: "et_2",
  Entertainment: "et_3",
  Utilities: "et_5",
  Other: "et_6",
}

interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  notes: string
  budgetId: null
}

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState("all")
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('user_id')
    
    if (token && userId) {
      fetchExpenses()
    }
  }, [])

  const fetchExpenses = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('user_id')
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/expense/all/${userId}`, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        toast.error(`${response.status}`)
      }
      
      const data: Expense[] = await response.json()
      setExpenses(data)
    } catch (error) {
      toast.error("Error fetching expenses")
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredExpenses = () => {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        const category = expense.category

        const matchesSearch =
          expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory = !selectedFilter || category === selectedFilter

        let matchesTimeframe = true
        if (selectedTimeframe === "24h") {
          matchesTimeframe = expenseDate >= oneDayAgo
        } else if (selectedTimeframe === "month") {
          matchesTimeframe = expenseDate >= oneMonthAgo
        } else if (selectedTimeframe === "year") {
          matchesTimeframe = expenseDate >= oneYearAgo
        }

        return matchesSearch && matchesCategory && matchesTimeframe
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const filteredExpenses = getFilteredExpenses()
  const categories = Array.from(new Set(expenses.map((expense) => expense.category)))
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const expensesByCategory = categories
    .map((category) => ({
      name: category,
      value: filteredExpenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0),
    }))
    .filter((item) => item.value > 0)

  const handleAddExpense = async (newExpense: Omit<Expense, "id" | "budgetId">) => {
    setIsLoading(true)
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('user_id')
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/expense/add`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          type_id: categoryId[newExpense.category as keyof typeof categoryId],
          amount: newExpense.amount,
          expense_date: newExpense.date,
          description: newExpense.description,
          notes: newExpense.notes,
        }),
      })
      
      if (!response.ok) {
        toast.error(`${response.status}`)
      }
      
      await fetchExpenses()
      setIsAddDialogOpen(false)
      toast.success("Successfully added Expense");
    } catch (error) {
      toast.error("Error adding expense")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditExpense = async (updatedExpense: Expense) => {
    setIsLoading(true)
    const token = localStorage.getItem('token')
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/expense/update/${updatedExpense.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type_id: categoryId[updatedExpense.category as keyof typeof categoryId],
          amount: updatedExpense.amount,
          expense_date: new Date(updatedExpense.date).toISOString().split('T')[0],
          description: updatedExpense.description,
          notes: updatedExpense.notes,
        }),
      })
      
      if (!response.ok) {
        toast.error(`${response.status}`)
      }
      
      await fetchExpenses()
      setIsEditDialogOpen(false)
      setSelectedExpense(null)
      toast.success("Expense Edited successfully")
    } catch (error) {
      toast.error("Error updating expense")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteExpense = async () => {
    if (selectedExpense) {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/expense/delete/${selectedExpense.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        
        if (!response.ok) {
          toast.success(`${response.status}`)
        }
        
        await fetchExpenses()
        setIsDeleteDialogOpen(false)
        setSelectedExpense(null)
        toast.success("Successfully deleted Expense");
      } catch (error) {
        toast.error("Error deleting expense")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage your expenses</p>
        </div>

        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="gradient-bg"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-purple-900/20 card-hover">
          <CardHeader>
            <CardTitle>Expense Summary</CardTitle>
            <CardDescription>Breakdown of your expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart>
              <Chart.Content>
                <Chart.ResponsiveContainer width="100%" height={300}>
                  <Chart.PieChart>
                    <Chart.Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Chart.Cell
                          key={`cell-${index}`}
                          fill={
                            ["#9333ea", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff", "#f3e8ff", "#6d28d9", "#4c1d95"][
                              index % 8
                            ]
                          }
                        />
                      ))}
                    </Chart.Pie>
                    <ChartTooltipContent formatter={(value) => `$${value.toFixed(2)}`} />
                  </Chart.PieChart>
                </Chart.ResponsiveContainer>
              </Chart.Content>
            </Chart>
          </CardContent>
        </Card>

        <MonthlyTrendChart/>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={selectedFilter === null} onCheckedChange={() => setSelectedFilter(null)}>
              All Categories
            </DropdownMenuCheckboxItem>
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedFilter === category}
                onCheckedChange={() => setSelectedFilter(category)}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tabs
          defaultValue="all"
          value={selectedTimeframe}
          onValueChange={setSelectedTimeframe}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" disabled={isLoading}>All</TabsTrigger>
            <TabsTrigger value="24h" disabled={isLoading}>24h</TabsTrigger>
            <TabsTrigger value="month" disabled={isLoading}>Month</TabsTrigger>
            <TabsTrigger value="year" disabled={isLoading}>Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-lg border border-purple-900/20 overflow-hidden">
        <div className="bg-card p-4 flex justify-between items-center">
          <h3 className="font-medium">Expense List</h3>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium">${totalAmount.toFixed(2)}</span>
          </p>
        </div>

        <div className="divide-y divide-purple-900/10">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => {
              const Icon = categoryIcons[expense.category as keyof typeof categoryIcons] || CreditCard

              return (
                <div
                  key={expense.id}
                  className="p-4 flex items-center hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedExpense(expense)}
                >
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
                    <p className="text-sm font-medium">{expense.description || "No description"}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{expense.category}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">-${expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {isLoading ? "Loading expenses..." : "No expenses found. Try adjusting your filters or add a new expense."}
            </div>
          )}
        </div>
      </div>

      {/* Expense Details Dialog */}
      {selectedExpense && (
        <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedExpense.description || "No description"}</DialogTitle>
              <DialogDescription>{selectedExpense.category}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-medium">${selectedExpense.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-lg font-medium">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedExpense.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1">{selectedExpense.notes}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(true)
                  }}
                  disabled={isLoading}
                >
                  Edit Expense
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDeleteDialogOpen(true)
                  }}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              <Button 
                onClick={() => setSelectedExpense(null)}
                disabled={isLoading}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Expense Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>Record a new expense</DialogDescription>
          </DialogHeader>

          <ExpenseForm 
            onSubmit={handleAddExpense} 
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update your expense details</DialogDescription>
          </DialogHeader>

          {selectedExpense && (
            <ExpenseForm
              initialData={selectedExpense}
              onSubmit={(updatedData) => handleEditExpense({
                ...selectedExpense, 
                ...updatedData 
              })}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteExpense}
              disabled={isLoading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ExpenseFormProps {
  initialData?: Expense
  onSubmit: (data: Omit<Expense, "id" | "budgetId">) => void
  onCancel: () => void
  isLoading: boolean
}

function ExpenseForm({ initialData, onSubmit, onCancel, isLoading }: ExpenseFormProps) {
  const [description, setDescription] = useState(initialData?.description || "")
  const [category, setCategory] = useState<string>(
    initialData?.category || "Food & Dining"
  )
  const [amount, setAmount] = useState(initialData?.amount.toString() || "")
  const [date, setDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.date) : new Date()
  )
  const [notes, setNotes] = useState(initialData?.notes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formattedDate = date!.toISOString().split('T')[0] // Convert to YYYY-MM-DD
    onSubmit({
      date: formattedDate,
      category,
      description,
      amount: Number.parseFloat(amount),
      notes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Input 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Select 
            value={category} 
            onValueChange={setCategory}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Food & Dining">Food & Dining</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Amount ($)
          </label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal"
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? date.toLocaleDateString() : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar 
                mode="single" 
                selected={date} 
                onSelect={setDate} 
                initialFocus 
                disabled={isLoading}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes (Optional)
        </label>
        <Input 
          id="notes" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="gradient-bg"
          disabled={isLoading}
        >
          {initialData ? "Update Expense" : "Add Expense"}
        </Button>
      </DialogFooter>
    </form>
  )
}