"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CreditCard, DollarSign, Home, LogOut, Menu, PieChart, Settings, User, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useRouter } from "next/navigation"
import {toast} from 'sonner'

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: CreditCard,
  },
  {
    title: "Budgets",
    href: "/budgets",
    icon: DollarSign,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()
  const handleLogout = () => {
    toast('Are you sure you want to logout?', {
      action: {
        label: 'Yes',
        onClick: () => {
          console.log("Logout")
          localStorage.removeItem("user_id")
          localStorage.removeItem("token")
          router.push("/")
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          console.log('Logout cancelled')
        },
      }
    })
  }
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "sidebar-gradient fixed top-0 bottom-0 left-0 z-50 border-r border-purple-900/20 transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0 md:w-20",
          "md:relative md:z-0",
        )}
      >
        {/* Close button for mobile */}
        {isMobile && isOpen && (
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}

        <div className={cn("flex h-full flex-col", !isOpen && "md:items-center", !isOpen && isMobile && "hidden")}>
          <div className={cn("flex items-center mb-8 px-4 h-16", !isOpen && "md:justify-center md:px-0")}>
            <DollarSign className="h-8 w-8 text-purple-500" />
            {isOpen && <h1 className="text-xl font-bold ml-2 text-purple-400">ExpenseTracker</h1>}
          </div>

          <div className="space-y-1 flex-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center py-2 px-3 rounded-md group transition-colors",
                  !isOpen && "md:justify-center md:px-0",
                  pathname === item.href
                    ? "bg-purple-900/20 text-purple-400"
                    : "text-muted-foreground hover:bg-purple-900/10 hover:text-purple-400",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110",
                    isOpen && "mr-3",
                    pathname === item.href ? "text-purple-400" : "text-muted-foreground",
                  )}
                />
                {isOpen && <span>{item.title}</span>}
              </Link>
            ))}
          </div>

          <div
            className={cn(
              "border-t border-purple-900/20 pt-4 mt-auto px-4 pb-4",
              !isOpen && "md:flex md:justify-center md:px-0",
            )}
          >
            {isOpen ? (
              <>
                <div className="flex items-center px-3 py-2 mb-2">
                  
                  <div className="ml-3">
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-red-400">
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-400" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export function SidebarToggle({ isOpen, setIsOpen }: SidebarProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:ml-4"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}

