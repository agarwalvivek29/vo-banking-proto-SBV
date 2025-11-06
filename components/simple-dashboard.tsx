"use client"

import { useState } from "react"
import { useAccount } from "@/context/account-context"
import SendMoneyModal from "./send-money-modal"

export default function SimpleDashboard() {
  const { balance, transactions } = useAccount()
  const [showSendModal, setShowSendModal] = useState(false)

  const totalSent = transactions.filter((txn) => txn.type === "sent").reduce((sum, txn) => sum + txn.amount, 0)
  const totalReceived = transactions.filter((txn) => txn.type === "received").reduce((sum, txn) => sum + txn.amount, 0)

  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
      <div className="grid gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-6 md:p-8 shadow-lg">
          <p className="text-xs md:text-sm font-medium opacity-90 mb-2">Total Balance</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 md:mb-8">₹{balance.toLocaleString()}</h2>
        </div>

        {/* Quick Stats - Responsive grid layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Total Received</p>
            <p className="text-2xl md:text-3xl font-bold text-secondary mb-2">₹{totalReceived.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">+2.5% this month</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Total Sent</p>
            <p className="text-2xl md:text-3xl font-bold text-destructive mb-2">₹{totalSent.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">-1.2% this month</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border border-border shadow-sm hover:shadow-md transition-shadow col-span-2 md:col-span-1">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Bills Due</p>
            <p className="text-2xl md:text-3xl font-bold text-primary mb-2">₹2,500</p>
            <p className="text-xs text-muted-foreground">Due in 5 days</p>
          </div>
        </div>

        {/* Recent Activity - Better mobile text sizing */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-bold">Recent Activity</h3>
            <a href="#" className="text-primary text-xs md:text-sm font-medium hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex justify-between items-center p-3 md:p-4 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div
                      className={`w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                        txn.type === "received"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {txn.type === "received" ? "📥" : "📤"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm md:text-base truncate">{txn.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {txn.date} • {txn.time}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold text-sm md:text-lg flex-shrink-0 ${txn.type === "received" ? "text-secondary" : "text-destructive"}`}
                  >
                    {txn.type === "received" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm py-4">No transactions yet</p>
            )}
          </div>
        </div>
      </div>

      <SendMoneyModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
    </div>
  )
}
