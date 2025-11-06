"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatINRWithSymbol } from "@/lib/currency"

export default function AccountCard() {
  const [showBalance, setShowBalance] = useState(true)
  const balance = 2458450

  return (
    <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground p-8 rounded-2xl">
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="text-sm opacity-80 mb-2">Total Balance</p>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-bold">{showBalance ? formatINRWithSymbol(balance) : "••••••••"}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalance(!showBalance)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80">Account Number</p>
          <p className="text-lg font-semibold">•••• •••• •••• 4829</p>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs opacity-60 mb-1">Card Holder</p>
          <p className="text-lg font-semibold">Sarah Anderson</p>
        </div>
        <div>
          <p className="text-xs opacity-60 mb-1">Expires</p>
          <p className="text-lg font-semibold">12/26</p>
        </div>
        <div className="w-12 h-8 bg-primary-foreground/30 rounded-lg" />
      </div>
    </Card>
  )
}
