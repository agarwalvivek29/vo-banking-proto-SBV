"use client"

import type React from "react"
import { useState } from "react"
import { useAccount } from "@/context/account-context"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SendMoneyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SendMoneyModal({ isOpen, onClose }: SendMoneyModalProps) {
  const { sendMoney, balance } = useAccount()
  const [recipientName, setRecipientName] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [showPIN, setShowPIN] = useState(false)
  const [pin, setPin] = useState("")
  const [pinError, setPinError] = useState("")
  const [pendingTransfer, setPendingTransfer] = useState<{ name: string; amount: number } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const amountNum = Number(amount)

    if (!recipientName || !amount) {
      setError("Please fill in all fields")
      return
    }

    if (amountNum <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    if (amountNum > balance) {
      setError(`Insufficient balance. Available: ₹${balance.toLocaleString("en-IN")}`)
      return
    }

    setPendingTransfer({ name: recipientName, amount: amountNum })
    setShowPIN(true)
  }

  const handlePINSubmit = () => {
    setPinError("")

    if (!pin) {
      setPinError("Please enter PIN")
      return
    }

    if (pin !== "1234") {
      setPinError("Invalid PIN. Correct PIN is 1234")
      return
    }

    if (pendingTransfer) {
      sendMoney(pendingTransfer.name, pendingTransfer.amount)
      setSubmitted(true)
      setTimeout(() => {
        setRecipientName("")
        setAmount("")
        setMessage("")
        setSubmitted(false)
        setShowPIN(false)
        setPin("")
        setPendingTransfer(null)
        onClose()
      }, 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Send Money</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-2">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-foreground font-semibold">Money sent successfully!</p>
            <p className="text-sm text-muted-foreground">
              ₹{pendingTransfer?.amount.toLocaleString("en-IN")} to {pendingTransfer?.name}
            </p>
          </div>
        ) : showPIN ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Confirm transfer to</p>
              <p className="text-lg font-semibold text-foreground">{pendingTransfer?.name}</p>
              <p className="text-2xl font-bold text-primary">₹{pendingTransfer?.amount.toLocaleString("en-IN")}</p>
            </div>

            {pinError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{pinError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 text-center">Enter PIN</label>
              <input
                type="password"
                placeholder="0000"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "")
                  setPin(val)
                }}
                className="w-full px-3 py-3 border border-input rounded-lg bg-background text-foreground text-center text-2xl font-bold placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground text-center mt-2">4-digit PIN for security verification</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPIN(false)
                  setPin("")
                  setPinError("")
                  setPendingTransfer(null)
                }}
                className="flex-1 bg-transparent"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handlePINSubmit}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!pin || pin.length !== 4}
              >
                Verify PIN
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Recipient Name</label>
              <input
                type="text"
                placeholder="Enter name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available balance: ₹{balance.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Message (Optional)</label>
              <textarea
                placeholder="Add a note"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!recipientName || !amount}
              >
                Confirm
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
