"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import LoginPage from "@/components/login-page"
import SimpleHeader from "@/components/simple-header"
import SimpleSidebar from "@/components/simple-sidebar"
import SimpleDashboard from "@/components/simple-dashboard"
import SimpleTransfers from "@/components/simple-transfers"
import SimpleTransactions from "@/components/simple-transactions"
import SimpleBills from "@/components/simple-bills"
import FullScreenChatbot from "@/components/full-screen-chatbot"
import QRScanner from "@/components/qr-scanner"
import AccountQRDisplay from "@/components/account-qr-display"
import { MoneyRequests } from "@/components/money-requests"

export default function Home() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("chat")
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showAccountQR, setShowAccountQR] = useState(false)

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <SimpleHeader onQRClick={() => setShowAccountQR(true)} />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <SimpleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {activeTab === "dashboard" && <SimpleDashboard />}
          {activeTab === "transfers" && <SimpleTransfers />}
          {activeTab === "transactions" && <SimpleTransactions />}
          {activeTab === "bills" && <SimpleBills />}
          {activeTab === "requests" && <MoneyRequests />}
          {activeTab === "qr" && (
            <div className="p-4 md:p-8">
              <div className="max-w-md mx-auto space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Quick QR Code Access</h2>
                <p className="text-muted-foreground">Choose what you'd like to do:</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="w-full p-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
                  >
                    📱 Scan QR Code to Receive Payment
                  </button>
                  <button
                    onClick={() => setShowAccountQR(true)}
                    className="w-full p-4 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition"
                  >
                    🔗 Show My Account QR Code
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "chat" && <FullScreenChatbot />}
        </main>
      </div>
      <QRScanner isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} />
      <AccountQRDisplay isOpen={showAccountQR} onClose={() => setShowAccountQR(false)} accountNumber="9876543210" />
    </div>
  )
}
