"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar, SidebarToggle } from "@/components/dashboard/sidebar"

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}
      >
        <Header>
          <SidebarToggle isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        </Header>
        <main className="flex-1 overflow-auto p-6 dashboard-gradient">{children}</main>
      </div>
    </div>
  )
}

