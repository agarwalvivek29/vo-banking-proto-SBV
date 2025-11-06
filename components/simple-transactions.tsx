"use client"

import { useState } from "react"
import { useAccount } from "@/context/account-context" // Import useAccount hook

export default function SimpleTransactions() {
  const { transactions } = useAccount() // Get transactions from context
  const [filter, setFilter] = useState("all")

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Transactions</h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {["all", "received", "sent"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="space-y-0">
          {filtered.map((txn) => (
            <div
              key={txn.id}
              className="p-4 border-b border-border last:border-b-0 flex justify-between items-center hover:bg-muted transition-colors"
            >
              <div>
                <p className="font-medium">{txn.name}</p>
                <p className="text-xs text-muted-foreground">
                  {txn.date} • {txn.time}
                </p>
              </div>
              <p className={`font-bold text-lg ${txn.type === "received" ? "text-secondary" : "text-destructive"}`}>
                {txn.type === "received" ? "+" : "-"}₹{txn.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
