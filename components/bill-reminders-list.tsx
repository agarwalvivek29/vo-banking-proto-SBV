"use client"

import { Bell, Trash2, Clock } from "lucide-react"
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

interface BillRemindersListProps {
  reminders: Reminder[]
  onDeleteReminder: (id: string) => void
}

export default function BillRemindersList({ reminders, onDeleteReminder }: BillRemindersListProps) {
  if (reminders.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">No reminders set yet</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Active Reminders</h3>
      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{reminder.billName}</p>
                <p className="text-xs text-muted-foreground">
                  {reminder.reminderDate} at {reminder.reminderTime}
                </p>
                <p className="text-xs text-secondary mt-1 capitalize">
                  {reminder.notificationType === "both" ? "Email & Push" : reminder.notificationType}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => onDeleteReminder(reminder.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
