"use client"

import { useState } from "react"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import AccountCard from "@/components/account-card"
import QuickStats from "@/components/quick-stats"
import RecentActivity from "@/components/recent-activity"
import SendMoneyModal from "@/components/send-money-modal"

export default function Dashboard() {
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [requestModalOpen, setRequestModalOpen] = useState(false)

  return (
    <div className="p-8 space-y-6">
      {/* Account Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AccountCard />
        </div>
        <QuickStats />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          onClick={() => setSendModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 gap-2"
        >
          <ArrowUpRight className="w-4 h-4" />
          Send Money
        </Button>
        <Button
          onClick={() => setRequestModalOpen(true)}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 gap-2"
        >
          <ArrowDownLeft className="w-4 h-4" />
          Request
        </Button>
        <Button variant="outline" className="h-12 bg-transparent">
          Add Card
        </Button>
        <Button variant="outline" className="h-12 bg-transparent">
          More
        </Button>
      </div>

      {/* Recent Activity */}
      <RecentActivity />

      <SendMoneyModal isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} type="send" />
      <SendMoneyModal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} type="request" />
    </div>
  )
}
