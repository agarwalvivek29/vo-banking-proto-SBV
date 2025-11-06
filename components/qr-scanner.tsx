"use client"

import { useState, useRef, useEffect } from "react"
import { useAccount } from "@/context/account-context"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
}

const FIXED_PIN = "1234" // Fixed PIN for security verification

export default function QRScanner({ isOpen, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [error, setError] = useState("")
  const { receiveMoney } = useAccount()
  const [amount, setAmount] = useState("")
  const [showPINInput, setShowPINInput] = useState(false) // Added PIN input state
  const [pin, setPin] = useState("") // Added PIN value state
  const [pinError, setPinError] = useState("") // Added PIN error state

  useEffect(() => {
    if (!isOpen) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setError("")
      } catch (err) {
        setError("Camera access denied. Please enable camera permissions.")
        console.log("[v0] Camera error:", err)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [isOpen])

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext("2d")
    if (!context) return

    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    // Simple QR code pattern detection (look for specific markers)
    const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
    const data = imageData.data

    let darkPixels = 0
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      if (brightness < 128) darkPixels++
    }

    // If QR-like pattern detected (20-40% dark pixels)
    if (darkPixels > data.length * 0.15 && darkPixels < data.length * 0.5) {
      // Simulate QR code read - in production, use a proper QR library
      const simulatedQRData = `account_transfer_${Math.random().toString(36).substr(2, 9)}`
      setScannedData(simulatedQRData)
      return true
    }

    return false
  }

  const handleScan = async () => {
    const found = await captureFrame()
    if (!found) {
      setError("No QR code detected. Try again.")
    }
  }

  const handleVerifyPIN = () => {
    if (pin !== FIXED_PIN) {
      setPinError("Invalid PIN. Please try again.")
      setPin("")
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    // Extract sender name from scanned data (simulate)
    const senderName = `Account ${scannedData?.split("_")[2]?.slice(0, 4) || "User"}`
    receiveMoney(senderName, Number(amount))

    setAmount("")
    setPin("")
    setScannedData(null)
    setShowPINInput(false)
    setTimeout(onClose, 1500)
  }

  const handleConfirmTransfer = () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    setShowPINInput(true)
    setPinError("")
  }

  const handleClose = () => {
    setScannedData(null)
    setAmount("")
    setError("")
    setPin("")
    setPinError("")
    setShowPINInput(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Scan QR Code</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!scannedData ? (
          <>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Point camera at a QR code to receive payment</p>

              <div className="relative bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full aspect-square object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button onClick={handleScan} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Capture & Scan
              </Button>
            </div>
          </>
        ) : showPINInput ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm font-semibold text-blue-600">Enter PIN to Confirm Payment</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">4-Digit PIN</label>
              <input
                type="password"
                placeholder="Enter PIN"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ""))
                  setPinError("")
                }}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
              />
            </div>

            {pinError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{pinError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => setShowPINInput(false)} variant="outline" className="flex-1 bg-transparent">
                Back
              </Button>
              <Button
                onClick={handleVerifyPIN}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={pin.length !== 4}
              >
                Verify & Pay
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold text-green-600">QR Code Scanned Successfully!</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Amount to Receive (₹)</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setScannedData(null)
                  setError("")
                }}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                Scan Again
              </Button>
              <Button
                onClick={handleConfirmTransfer}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!amount || Number(amount) <= 0}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
