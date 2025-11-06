"use client"

import { useState } from "react"
import { X, Bell } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Reminder {
  id: string
  billId: number
  billName: string
  reminderDate: string
  reminderTime: string
  notificationType: "email" | "push" | "both"
}

interface ReminderModalProps {
  billId: number
  billName: string
  onClose: () => void
  onSave: (reminder: Reminder) => void
}

export default function ReminderModal({ billId, billName, onClose, onSave }: ReminderModalProps) {
  const [reminderDate, setReminderDate] = useState("")
  const [reminderTime, setReminderTime] = useState("09:00")
  const [notificationType, setNotificationType] = useState<"email" | "push" | "both">("both")

  const handleSave = () => {
    if (!reminderDate) {
      alert("Please select a reminder date")
      return
    }

    const reminder: Reminder = {
      id: `${billId}-${Date.now()}`,
      billId,
      billName,
      reminderDate,
      reminderTime,
      notificationType,
    }

    onSave(reminder)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Set Reminder</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Bill</p>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{billName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Reminder Date</label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Reminder Time</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Notification Type</label>
            <div className="space-y-2">
              {["email", "push", "both"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={type}
                    checked={notificationType === type}
                    onChange={(e) => setNotificationType(e.target.value as "email" | "push" | "both")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground capitalize">{type === "both" ? "Email & Push" : type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave}>
              Save Reminder
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
