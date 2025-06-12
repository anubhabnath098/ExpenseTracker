import type React from "react"
import { AppShell } from "@/components/app-shell"

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}

