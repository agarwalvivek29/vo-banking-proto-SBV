"use client"

import { useState } from "react"
import { Search, Filter, Download, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatINRWithSymbol } from "@/lib/currency"

interface Transaction {
  id: number
  type: string
  description: string
  category: string
  amount: number
  date: string
  status: "completed" | "pending"
}

export default function TransactionsList() {
  const [filterType, setFilterType] = useState("all")

  const transactions: Transaction[] = [
    {
      id: 1,
      type: "debit",
      description: "Apple Store Purchase",
      category: "Shopping",
      amount: 29999,
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: 2,
      type: "credit",
      description: "Freelance Project Payment",
      category: "Income",
      amount: 150000,
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: 3,
      type: "debit",
      description: "Electricity Bill",
      category: "Utilities",
      amount: 12550,
      date: "2024-01-13",
      status: "completed",
    },
    {
      id: 4,
      type: "debit",
      description: "Restaurant Dining",
      category: "Food & Dining",
      amount: 6875,
      date: "2024-01-12",
      status: "pending",
    },
    {
      id: 5,
      type: "credit",
      description: "Cashback Reward",
      category: "Rewards",
      amount: 4500,
      date: "2024-01-11",
      status: "completed",
    },
    {
      id: 6,
      type: "debit",
      description: "Gym Membership",
      category: "Health",
      amount: 4999,
      date: "2024-01-10",
      status: "completed",
    },
  ]

  const filtered = filterType === "all" ? transactions : transactions.filter((t) => t.type === filterType)

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and view all your transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          {["all", "credit", "debit"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-colors ${
                filterType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type === "all" ? "All Transactions" : type === "credit" ? "Received" : "Sent"}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                <th className="text-center py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4 text-foreground">{tx.description}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{tx.category}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{tx.date}</td>
                  <td
                    className={`py-4 px-4 text-right font-semibold ${tx.type === "credit" ? "text-accent" : "text-foreground"}`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {formatINRWithSymbol(tx.amount).replace("₹", "")}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        tx.status === "completed" ? "bg-accent/20 text-accent" : "bg-secondary/20 text-secondary"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
