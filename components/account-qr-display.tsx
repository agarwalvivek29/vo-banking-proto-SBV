"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

interface AccountQRDisplayProps {
  isOpen: boolean
  onClose: () => void
  accountNumber?: string
}

export default function AccountQRDisplay({ isOpen, onClose, accountNumber = "1234567890" }: AccountQRDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  useEffect(() => {
    if (isOpen) {
      // Generate QR code using qrserver API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `BANK_ACCOUNT_${accountNumber}_PAY_ME`,
      )}`
      setQrCodeUrl(qrUrl)
    }
  }, [isOpen, accountNumber])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `account-qr-${accountNumber}.png`
    link.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Your Account QR Code</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share this QR code to receive payments instantly. Others can scan it to send you money.
          </p>

          <div className="flex justify-center p-4 bg-muted rounded-lg">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt="Account QR Code"
                className="w-56 h-56 border-4 border-primary rounded-lg"
              />
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Account Number</p>
            <p className="font-mono font-semibold text-foreground text-lg">{accountNumber}</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Close
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
