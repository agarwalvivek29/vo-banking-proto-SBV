"use client"

import { useAccount } from "@/context/account-context"
import ReminderModal from "./reminder-modal"
import { useState } from "react"

export default function SimpleBills() {
  const { bills, payBill } = useAccount()
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState<{ id: number; name: string } | null>(null)
  const [reminders, setReminders] = useState<any[]>([])

  const handlePay = (billId: number) => {
    payBill(billId)
  }

  const handleReminder = (billId: number) => {
    const bill = bills.find((b) => b.id === billId)
    if (bill) {
      setSelectedBill({ id: billId, name: bill.name })
      setShowReminderModal(true)
    }
  }

  const handleSaveReminder = (reminder: any) => {
    setReminders([...reminders, reminder])
    setShowReminderModal(false)
    alert(`Reminder set for ${selectedBill?.name} on ${reminder.reminderDate}`)
  }

  const pendingBills = bills.filter((bill) => bill.status === "pending")

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Bills</h2>

      <div className="space-y-3">
        {pendingBills.length > 0 ? (
          pendingBills.map((bill) => (
            <div
              key={bill.id}
              className="bg-card rounded-lg p-4 border border-border flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{bill.name}</p>
                <p className="text-sm text-muted-foreground">Due: {bill.dueDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-lg">₹{bill.amount.toLocaleString()}</p>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-destructive/20 text-destructive">
                  Pending
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePay(bill.id)}
                    className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium hover:opacity-90 transition-all"
                  >
                    Pay
                  </button>
                  <button
                    onClick={() => handleReminder(bill.id)}
                    className="bg-muted text-foreground px-3 py-1 rounded text-sm font-medium hover:bg-border transition-all"
                  >
                    Remind
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-lg">No pending bills</p>
          </div>
        )}
      </div>

      {showReminderModal && selectedBill && (
        <ReminderModal
          billId={selectedBill.id}
          billName={selectedBill.name}
          onClose={() => setShowReminderModal(false)}
          onSave={handleSaveReminder}
        />
      )}
    </div>
  )
}
