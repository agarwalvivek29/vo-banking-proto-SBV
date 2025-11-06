"use client"

import type React from "react"

import { CreditCard, Send, Download, ShoppingCart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useAccount } from "@/context/account-context"

const iconMap: Record<string, React.ElementType> = {
  send: Send,
  received: Download,
  shopping: ShoppingCart,
  payment: CreditCard,
}

export default function RecentActivity() {
  const { transactions } = useAccount()

  // Map transaction types to icons
  const getIcon = (name: string) => {
    if (name.toLowerCase().includes("salary") || name.toLowerCase().includes("freelance")) {
      return Download
    }
    return Send
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          transactions.map((tx) => {
            const Icon = getIcon(tx.name)
            return (
              <div key={tx.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{tx.name}</p>
                  <p className="text-xs text-muted-foreground">{tx.time}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${tx.type === "received" ? "text-accent" : "text-foreground"}`}>
                    {tx.type === "received" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
