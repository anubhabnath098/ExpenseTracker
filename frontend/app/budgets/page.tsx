"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown, DollarSign, Filter, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartTooltip } from "@/components/ui/chart"
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
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {toast} from 'sonner'
import { cn } from "@/lib/utils"

const COLORS = ["#9333ea", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff", "#f3e8ff"]

const categoryId = {
  "Food & Dining": "et_1",
  Shopping: "et_4",
  Transportation: "et_2",
  Entertainment: "et_3",
  Utilities: "et_5",
  Other: "et_6",
}

interface Budget {
  id: string
  name: string
  category: string
  limit: number
  spent: number
  startDate: Date
  endDate: Date
  notes?: string
}

export default function BudgetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [budgets, setBudgets] = useState<Budget[]>([])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  const fetchBudgets = async () => {
    const user_id = localStorage.getItem("user_id")
    if (!user_id) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget/all/${user_id}`, {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      const formattedBudgets = data.map((budget: any) => ({
        id: budget.id,
        name: budget.name,
        category:budget.category,
        limit: budget.limit,
        spent: budget.spent,
        startDate: new Date(budget.startDate),
        endDate: new Date(budget.endDate),
        notes: budget.notes,
      }))
      setBudgets(formattedBudgets)
    } catch (error) {
      toast.error("Error fetching budgets")
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch =
      budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !selectedFilter || budget.category === selectedFilter
    return matchesSearch && matchesFilter
  })

  const categories = Array.from(new Set(budgets.map((budget) => budget.category)))

  const handleAddBudget = async (newBudget: Omit<Budget, "id">) => {
    const user_id = localStorage.getItem("user_id")
    if (!user_id) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id,
          type_id: categoryId[newBudget.category as keyof typeof categoryId] || "et_6",
          budget_limit: newBudget.limit,
          budget_name: newBudget.name,
          budget_spent: newBudget.spent,
          start_date: format(newBudget.startDate, "yyyy-MM-dd"),
          end_date: format(newBudget.endDate, "yyyy-MM-dd"),
          notes: newBudget.notes,
        }),
      })
      if (response.ok) {
        await fetchBudgets()
        setIsAddDialogOpen(false)
        toast.success("Budget added successfully")
      }
    } catch (error) {
      toast.error("Error adding budget");
    }
  }

  const handleEditBudget = async (updatedBudget: Budget) => {
    const user_id = localStorage.getItem("user_id")
    if (!user_id) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget/update/${updatedBudget.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id,
          type_id: categoryId[updatedBudget.category as keyof typeof categoryId] || "et_6",
          budget_name: updatedBudget.name,
          budget_limit: updatedBudget.limit,
          budget_spent: updatedBudget.spent,
          start_date: format(updatedBudget.startDate, "yyyy-MM-dd"),
          end_date: format(updatedBudget.endDate, "yyyy-MM-dd"),
          notes: updatedBudget.notes,
        }),
      })
      if (response.ok) {
        await fetchBudgets()
        setIsEditDialogOpen(false)
        setSelectedBudget(null)
        toast.success("Budget edited successfully")
      }
    } catch (error) {
      toast.error("Error updating budget")
    }
  }

  const handleDeleteBudget = async () => {
    if (!selectedBudget) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget/delete/${selectedBudget.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        await fetchBudgets()
        setIsDeleteDialogOpen(false)
        setSelectedBudget(null)
        toast.success("Budget deleted Successfully")
      }
    } catch (error) {
      toast.error("Error deleting budget")
    }
  }

  return (
    <div className="space-y-6 animate-fade-in grid-pattern">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-400">Budgets</h1>
          <p className="text-muted-foreground mt-1">Manage and track your budget plans</p>
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-bg text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search budgets..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
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
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBudgets.map((budget) => {
          const percentage = Math.min(Math.round((budget.spent / budget.limit) * 100), 100)
          const isOverBudget = budget.spent > budget.limit

          return (
            <Card
              key={budget.id}
              className={cn(
                "budget-card card-hover cursor-pointer transition-all",
                isOverBudget && "expense-over-limit",
              )}
              onClick={() => setSelectedBudget(budget)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{budget.name}</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-purple-900/20 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-purple-400" />
                  </div>
                </div>
                <CardDescription>{budget.category}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Budget</span>
                    <span className={isOverBudget ? "text-red-400" : ""}>
                      ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-2 ${isOverBudget ? "bg-red-950" : "bg-muted"}`}
                    indicatorClassName={isOverBudget ? "bg-red-500" : "bg-purple-500"}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {format(budget.startDate, "MMM d")} - {format(budget.endDate, "MMM d, yyyy")}
                    </span>
                    <span className={isOverBudget ? "text-red-400" : "text-green-400"}>{percentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedBudget && (
        <Dialog open={!!selectedBudget} onOpenChange={(open) => !open && setSelectedBudget(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedBudget.name}</DialogTitle>
              <DialogDescription>{selectedBudget.category}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Budget Details</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Limit</p>
                      <p className="text-lg font-medium">${selectedBudget.limit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Spent</p>
                      <p className="text-lg font-medium">${selectedBudget.spent.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="text-lg font-medium">{format(selectedBudget.startDate, "MMM d, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="text-lg font-medium">{format(selectedBudget.endDate, "MMM d, yyyy")}</p>
                    </div>
                  </div>
                </div>

                {selectedBudget.notes && (
                  <div>
                    <h3 className="text-lg font-medium">Notes</h3>
                    <p className="text-sm mt-1">{selectedBudget.notes}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium">Budget Progress</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className={selectedBudget.spent > selectedBudget.limit ? "text-red-400" : ""}>
                        ${selectedBudget.spent.toFixed(2)} / ${selectedBudget.limit.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(Math.round((selectedBudget.spent / selectedBudget.limit) * 100), 100)}
                      className={selectedBudget.spent > selectedBudget.limit ? "bg-red-950" : "bg-muted"}
                      indicatorClassName={selectedBudget.spent > selectedBudget.limit ? "bg-red-500" : "bg-purple-500"}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Spending Trend</h3>
                <Chart>
                  <Chart.Content>
                    <Chart.ResponsiveContainer width="100%" height={200}>
                      <Chart.PieChart>
                        <Chart.Pie
                          data={[
                            { name: "Spent", value: selectedBudget.spent },
                            { name: "Remaining", value: Math.max(0, selectedBudget.limit - selectedBudget.spent) },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Chart.Cell fill="#9333ea" />
                          <Chart.Cell fill="#e9d5ff" />
                        </Chart.Pie>
                        <ChartTooltip formatter={(value:any) => `$${value}`} />
                      </Chart.PieChart>
                    </Chart.ResponsiveContainer>
                  </Chart.Content>
                </Chart>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(true)
                  }}
                >
                  Edit Budget
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              <Button onClick={() => setSelectedBudget(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Budget</DialogTitle>
            <DialogDescription>Create a new budget to track your expenses</DialogDescription>
          </DialogHeader>
          <BudgetForm onSubmit={(data) => handleAddBudget(data)} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setSelectedBudget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>Update your budget details</DialogDescription>
          </DialogHeader>
          {selectedBudget && (
            <BudgetForm
              key={selectedBudget.id} // Add key to force re-render
              initialData={selectedBudget}
              onSubmit={(data) => handleEditBudget({ ...data, id: selectedBudget.id })}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedBudget(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBudget}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BudgetForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Budget
  onSubmit: (data: Omit<Budget, "id">) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initialData?.name || "")
  const [category, setCategory] = useState(initialData?.category || "")
  const [limit, setLimit] = useState(initialData?.limit.toString() || "")
  const [startDate, setStartDate] = useState<Date | undefined>(initialData?.startDate || new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(initialData?.endDate || new Date())
  const [notes, setNotes] = useState(initialData?.notes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      name,
      category,
      limit: Number.parseFloat(limit),
      spent: initialData ? initialData.spent : 0,
      startDate: startDate!,
      endDate: endDate!,
      notes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Budget Name
          </label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Food & Dining">Food & Dining</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="limit" className="text-sm font-medium">
            Budget Limit ($)
          </label>
          <Input
            id="limit"
            type="number"
            min="0"
            step="0.01"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="startDate" className="text-sm font-medium">
            Start Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label htmlFor="endDate" className="text-sm font-medium">
            End Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes (Optional)
        </label>
        <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="gradient-bg text-white">
          {initialData ? "Update Budget" : "Create Budget"}
        </Button>
      </DialogFooter>
    </form>
  )
}
