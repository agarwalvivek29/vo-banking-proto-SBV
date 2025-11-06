"use client"

import { useEffect, useState } from "react"

type RecognitionEvent = {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string
      }
      isFinal: boolean
    }
  }
}

export function useVoiceCommand(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: RecognitionEvent) => {
      let finalTranscript = ""

      for (let i = event.results.length - 1; i >= 0; i--) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript.trim())
        onTranscript(finalTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error)
    }

    const startListening = () => {
      recognition.start()
    }

    const stopListening = () => {
      recognition.stop()
    }

    return () => {
      recognition.abort()
    }
  }, [onTranscript])

  return { isListening, transcript, isSupported }
}
