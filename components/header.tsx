"use client"

import { Bell, Settings, User, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Header() {
  const [voiceActive, setVoiceActive] = useState(false)

  const startHeaderVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      setVoiceActive(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setVoiceActive(true)
      }

      recognition.onend = () => {
        setVoiceActive(false)
      }

      recognition.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.results.length - 1; i >= 0; i--) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript
          }
        }

        if (transcript) {
          console.log("[v0] Voice command:", transcript)
          const lowerTranscript = transcript.toLowerCase()

          // Simple voice commands
          if (lowerTranscript.includes("check balance") || lowerTranscript.includes("balance")) {
            window.location.hash = "#dashboard"
          } else if (lowerTranscript.includes("transactions") || lowerTranscript.includes("history")) {
            window.location.hash = "#transactions"
          } else if (lowerTranscript.includes("bills") || lowerTranscript.includes("payments")) {
            window.location.hash = "#bills"
          } else if (lowerTranscript.includes("send money") || lowerTranscript.includes("transfer")) {
            const event = new CustomEvent("openSendMoney")
            window.dispatchEvent(event)
          }
        }

        setVoiceActive(false)
      }

      recognition.start()
    }
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Bank</h1>
          <p className="text-sm text-muted-foreground">Welcome back, Sarah</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={startHeaderVoiceCommand}
            className={voiceActive ? "bg-red-500/20" : ""}
          >
            <Mic className={`w-5 h-5 ${voiceActive ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  )
}
