"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatINRWithSymbol } from "@/lib/currency"

export default function QuickStats() {
  const stats = [
    {
      label: "Income",
      value: 1250000,
      change: "+15.3%",
      icon: TrendingUp,
      positive: true,
    },
    {
      label: "Expenses",
      value: 824000,
      change: "+5.2%",
      icon: TrendingDown,
      positive: false,
    },
    {
      label: "Savings",
      value: 426000,
      change: "+22.1%",
      icon: TrendingUp,
      positive: true,
    },
  ]

  return (
    <div className="space-y-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {stat.positive ? "+" : "-"}
                  {formatINRWithSymbol(stat.value).replace("₹", "")}
                </p>
              </div>
              <div className="text-right">
                <Icon className={`w-6 h-6 mb-2 ${stat.positive ? "text-accent" : "text-destructive"}`} />
                <p className={`text-xs font-semibold ${stat.positive ? "text-accent" : "text-destructive"}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
