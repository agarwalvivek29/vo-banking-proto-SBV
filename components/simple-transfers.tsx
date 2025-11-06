"use client"

import { useState } from "react"
import { useAccount } from "@/context/account-context"
import SendMoneyModal from "./send-money-modal"

export default function SimpleTransfers() {
  const { balance, savings, addToSavings } = useAccount()
  const [showSendModal, setShowSendModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showSavingsModal, setShowSavingsModal] = useState(false)
  const [savingsAmount, setSavingsAmount] = useState("")
  const [savingsGoal, setSavingsGoal] = useState("")

  const handleSaveChanges = () => {
    const amount = Number.parseFloat(savingsAmount)
    if (amount > 0) {
      addToSavings(amount)
      setSavingsAmount("")
      setSavingsGoal("")
      setShowSavingsModal(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Money Transfers</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div
          className="bg-card rounded-lg p-6 md:p-8 border border-border hover:border-primary transition-colors cursor-pointer active:scale-95 transition-transform"
          onClick={() => setShowSendModal(true)}
        >
          <div className="text-center">
            <div className="mb-4 text-4xl md:text-5xl">📤</div>
            <h2 className="text-lg md:text-xl font-bold mb-2">Send Money</h2>
            <p className="text-xs md:text-sm text-muted-foreground mb-4">Transfer funds to another account</p>
            <button className="w-full bg-primary text-primary-foreground px-4 py-3 md:py-2 rounded font-medium hover:opacity-90 transition-all active:opacity-75">
              Send Now
            </button>
          </div>
        </div>

        <div
          className="bg-card rounded-lg p-6 md:p-8 border border-border hover:border-secondary transition-colors cursor-pointer active:scale-95 transition-transform"
          onClick={() => setShowRequestModal(true)}
        >
          <div className="text-center">
            <div className="mb-4 text-4xl md:text-5xl">📥</div>
            <h2 className="text-lg md:text-xl font-bold mb-2">Request Money</h2>
            <p className="text-xs md:text-sm text-muted-foreground mb-4">Request funds from someone</p>
            <button className="w-full bg-secondary text-secondary-foreground px-4 py-3 md:py-2 rounded font-medium hover:opacity-90 transition-all active:opacity-75">
              Request Now
            </button>
          </div>
        </div>

        <div
          className="bg-card rounded-lg p-6 md:p-8 border border-border hover:border-accent transition-colors cursor-pointer active:scale-95 transition-transform"
          onClick={() => setShowSavingsModal(true)}
        >
          <div className="text-center">
            <div className="mb-4 text-4xl md:text-5xl">💰</div>
            <h2 className="text-lg md:text-xl font-bold mb-2">Savings</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">₹{savings.toLocaleString()}</p>
            <button className="w-full bg-accent text-accent-foreground px-4 py-3 md:py-2 rounded font-medium hover:opacity-90 transition-all active:opacity-75">
              View Details
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-bold mb-4">Recent Transfers</h3>
        <div className="space-y-3">
          {[
            { type: "sent", name: "John Doe", amount: "₹500", time: "Today" },
            { type: "received", name: "Sarah Smith", amount: "₹2,000", time: "Yesterday" },
            { type: "sent", name: "Mike Johnson", amount: "₹1,500", time: "2 days ago" },
          ].map((transfer, idx) => (
            <div key={idx} className="flex justify-between items-center pb-3 border-b border-border last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {transfer.type === "sent" ? "📤" : "📥"}
                </div>
                <div>
                  <p className="font-medium">{transfer.name}</p>
                  <p className="text-xs text-muted-foreground">{transfer.time}</p>
                </div>
              </div>
              <p className={transfer.type === "sent" ? "text-destructive font-medium" : "text-secondary font-medium"}>
                {transfer.type === "sent" ? "-" : "+"}
                {transfer.amount}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Request Money</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Person's Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full px-3 py-3 md:py-2 border border-border rounded text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full px-3 py-3 md:py-2 border border-border rounded text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                <textarea
                  placeholder="Add a note"
                  className="w-full px-3 py-3 md:py-2 border border-border rounded text-base"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-3 md:py-2 border border-border rounded hover:bg-muted transition-colors text-sm md:text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-3 md:py-2 bg-secondary text-secondary-foreground rounded hover:opacity-90 transition-all text-sm md:text-base font-medium"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSavingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Your Savings</h2>
            <div className="space-y-4">
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Total Savings</p>
                <p className="text-2xl md:text-3xl font-bold text-accent">₹{savings.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Add to Savings (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                  className="w-full px-3 py-3 md:py-2 border border-border rounded text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Savings Goal</label>
                <input
                  type="text"
                  placeholder="e.g., Vacation, Car"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  className="w-full px-3 py-3 md:py-2 border border-border rounded text-base"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSavingsModal(false)}
                  className="flex-1 px-4 py-3 md:py-2 border border-border rounded hover:bg-muted transition-colors text-sm md:text-base font-medium"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={
                    !savingsAmount ||
                    Number.parseFloat(savingsAmount) <= 0 ||
                    Number.parseFloat(savingsAmount) > balance
                  }
                  className="flex-1 px-4 py-3 md:py-2 bg-accent text-accent-foreground rounded hover:opacity-90 transition-all text-sm md:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
              {savingsAmount && Number.parseFloat(savingsAmount) > balance && (
                <p className="text-sm text-red-500">Insufficient balance</p>
              )}
            </div>
          </div>
        </div>
      )}

      <SendMoneyModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
    </div>
  )
}
