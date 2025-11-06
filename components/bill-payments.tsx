"use client"

import { useState } from "react"
import { Plus, Clock, CheckCircle, AlertCircle, Bell } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatINRWithSymbol } from "@/lib/currency"
import { useAccount } from "@/context/account-context"
import ReminderModal from "./reminder-modal"
import BillRemindersList from "./bill-reminders-list"

interface BillPaymentBill {
  id: number
  company: string
  category: string
  dueDate: string
  amount: number
  status: "paid" | "pending" | "overdue"
}

interface Reminder {
  id: string
  billId: number
  billName: string
  reminderDate: string
  reminderTime: string
  notificationType: "email" | "push" | "both"
}

export default function BillPayments() {
  const { bills: contextBills, payBill } = useAccount()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [selectedBillForReminder, setSelectedBillForReminder] = useState<{ id: number; name: string } | null>(null)

  const bills: BillPaymentBill[] = contextBills.map((bill) => ({
    id: bill.id,
    company: bill.name,
    category: "Utilities",
    dueDate: bill.dueDate,
    amount: bill.amount,
    status: bill.status === "paid" ? "paid" : "pending",
  }))

  const handlePayBill = (id: number) => {
    const bill = bills.find((b) => b.id === id)
    if (bill && contextBills.some((cb) => cb.id === id && cb.status === "pending")) {
      // Check balance through account context
      payBill(id)
    }
  }

  const handleSetReminder = (bill: BillPaymentBill) => {
    setSelectedBillForReminder({ id: bill.id, name: bill.company })
    setShowReminderModal(true)
  }

  const handleSaveReminder = (reminder: Reminder) => {
    setReminders([...reminders, reminder])
    setShowReminderModal(false)
    setSelectedBillForReminder(null)
  }

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-accent" />
      case "pending":
        return <Clock className="w-5 h-5 text-secondary" />
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-destructive" />
      default:
        return null
    }
  }

  const pendingBills = bills.filter((b) => b.status === "pending" || b.status === "overdue")
  const totalDue = pendingBills.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bill Payments</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your bills and payments</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" />
          Add New Bill
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Due</p>
          <p className="text-3xl font-bold text-destructive mt-2">{formatINRWithSymbol(totalDue).replace("₹", "")}</p>
          <p className="text-xs text-muted-foreground mt-2">{pendingBills.length} bills pending</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-3xl font-bold text-accent mt-2">{formatINRWithSymbol(35548).replace("₹", "")}</p>
          <p className="text-xs text-muted-foreground mt-2">5 bills this month</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Next Due</p>
          <p className="text-3xl font-bold text-foreground mt-2">2024-01-25</p>
          <p className="text-xs text-muted-foreground mt-2">Electric Company</p>
        </Card>
      </div>

      {/* Bills List */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">All Bills</h3>
        <div className="space-y-4">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  {getStatusIcon(bill.status)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{bill.company}</p>
                  <p className="text-sm text-muted-foreground">{bill.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-bold text-foreground">{formatINRWithSymbol(bill.amount).replace("₹", "")}</p>
                  <p
                    className={`text-xs font-medium capitalize ${
                      bill.status === "paid"
                        ? "text-accent"
                        : bill.status === "overdue"
                          ? "text-destructive"
                          : "text-secondary"
                    }`}
                  >
                    {bill.status === "paid" ? "Paid" : bill.status === "overdue" ? "Overdue" : `Due ${bill.dueDate}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-transparent"
                    onClick={() => handleSetReminder(bill)}
                  >
                    <Bell className="w-4 h-4" />
                    Remind
                  </Button>
                  {bill.status !== "paid" && (
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => handlePayBill(bill.id)}
                    >
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Reminders</h2>
        <BillRemindersList reminders={reminders} onDeleteReminder={handleDeleteReminder} />
      </div>

      {showReminderModal && selectedBillForReminder && (
        <ReminderModal
          billId={selectedBillForReminder.id}
          billName={selectedBillForReminder.name}
          onClose={() => setShowReminderModal(false)}
          onSave={handleSaveReminder}
        />
      )}
    </div>
  )
}
