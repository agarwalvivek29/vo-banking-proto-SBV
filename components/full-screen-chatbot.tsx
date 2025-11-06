"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAccount } from "@/context/account-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function FullScreenChatbot() {
  const { balance, savings, transactions: allTransactions, bills } = useAccount()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US")
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const languages = [
    { code: "en-US", name: "English" },
    { code: "hi-IN", name: "हिंदी (Hindi)" },
    { code: "ta-IN", name: "தமிழ் (Tamil)" },
    { code: "te-IN", name: "తెలుగు (Telugu)" },
    { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)" },
    { code: "mr-IN", name: "मराठी (Marathi)" },
    { code: "bn-IN", name: "বাংলা (Bengali)" },
    { code: "gu-IN", name: "ગુજરાતી (Gujarati)" },
  ]

  const initializeSpeechRecognition = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition && !recognitionRef.current) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = selectedLanguage

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event: any) => {
          let interimTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              setInput((prev) => prev + transcript)
            } else {
              interimTranscript += transcript
            }
          }
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }

  const handleMicClick = () => {
    initializeSpeechRecognition()
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop()
        setIsListening(false)
      } else {
        recognitionRef.current.lang = selectedLanguage
        recognitionRef.current.start()
      }
    }
  }

  const generateResponse = (
    userMessage: string,
    language: string,
    currentBalance: number,
    currentSavings: number,
    currentTransactions: any[],
    currentBills: any[],
  ): string => {
    const lowerMessage = userMessage.toLowerCase()

    const responses: { [key: string]: { [lang: string]: string[] } } = {
      balance: {
        "en-US": [
          `Your current account balance is ₹${currentBalance.toLocaleString()}. You have ₹${Math.floor(currentBalance * 0.8).toLocaleString()} available for withdrawal.`,
        ],
        "hi-IN": [`आपका वर्तमान खाता संतुलन ₹${currentBalance.toLocaleString()} है।`],
        "ta-IN": [`உங்கள் தற்போதைய கணக்கு இருப்பு ₹${currentBalance.toLocaleString()} உள்ளது.`],
        "te-IN": [`మీ ప్రస్తుత ఖాతా సమతుల్యత ₹${currentBalance.toLocaleString()} ఉంది.`],
        "kn-IN": [`ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಖಾತೆ ಸಮತೋಲನ ₹${currentBalance.toLocaleString()} ಉಂದು.`],
        "mr-IN": [`आपल्या सध्याच्या खाते शेष ₹${currentBalance.toLocaleString()} आहे.`],
        "bn-IN": [`আপনার বর্তমান অ্যাকাউন্ট ব্যালেন্স ₹${currentBalance.toLocaleString()}।`],
        "gu-IN": [`તમારા હાલના ખાતા બેલેન્સ ₹${currentBalance.toLocaleString()} છે.`],
      },
      savings: {
        "en-US": [`Your current savings are ₹${currentSavings.toLocaleString()}.`],
        "hi-IN": [`आपकी वर्तमान बचत ₹${currentSavings.toLocaleString()} है।`],
        "ta-IN": [`உங்கள் தற்போதைய சேமிப்பு ₹${currentSavings.toLocaleString()} உள்ளது.`],
        "te-IN": [`మీ ప్రస్తుత సేవింగ్‌లు ₹${currentSavings.toLocaleString()} ఉంది.`],
        "kn-IN": [`ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸಂಪದ ₹${currentSavings.toLocaleString()} ಉಂದು.`],
        "mr-IN": [`आपल्या सध्याच्या बचत ₹${currentSavings.toLocaleString()} आहे.`],
        "bn-IN": [`আপনার বর্তমান সঞ্চয় ₹${currentSavings.toLocaleString()}।`],
        "gu-IN": [`તમારી હાલની બચત ₹${currentSavings.toLocaleString()} છે.`],
      },
      transactions: {
        "en-US": [`You have ${currentTransactions.length} recent transactions.`],
        "hi-IN": [`आपके पास ${currentTransactions.length} हाल के लेनदेन हैं।`],
        "ta-IN": [`உங்களிடம் ${currentTransactions.length} சமீபத்திய பரிமாற்றங்கள் உள்ளன.`],
        "te-IN": [`మీకు ${currentTransactions.length} ఇటీవలి లెనదేన్‌లు ఉన్నాయి.`],
        "kn-IN": [`ನೀವು ${currentTransactions.length} ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳನ್ನು ಹೊಂದಿರುವಿರಿ.`],
        "mr-IN": [`आपल्याकडे ${currentTransactions.length} अलीकडील व्यवहार आहेत.`],
        "bn-IN": [`আপনার কাছে ${currentTransactions.length} সম্প্রতিকালীন লেনদেন রয়েছে।`],
        "gu-IN": [`તમારી પાસે ${currentTransactions.length} તાજેતરના વ્યવહાર છે.`],
      },
      help: {
        "en-US": ["I can help with balance inquiries, transactions, bills, and account information."],
        "hi-IN": ["मैं शेष, लेनदेन, बिल और खाता जानकारी में मदद कर सकता हूं।"],
        "ta-IN": ["நான் இருப்பு, பரிமாற்றங்கள், பில்கள் மற்றும் கணக்கு தகவல்களில் உதவ முடிகிறது।"],
        "te-IN": ["నేను బ్యాలెన్స్, లెనదెన్‌లు, బిల్‌లు మరియు ఖాతా సమాచారానికి సహాయ చేయగలను."],
        "kn-IN": ["ನಾನು ಬ್ಯಾಲೆನ್ಸ್, ವಹಿವಾಟುಗಳು, ಬಿಲ್‌ಗಳು ಮತ್ತು ಖಾತೆ ಮಾಹಿತಿಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು."],
        "mr-IN": ["मैं शेष, व्यवहार, बिल और खाता जानकारी में मदद कर सकता हूं।"],
        "bn-IN": ["আমি ব্যালেন্স, লেনদেন, বিল এবং অ্যাকাউন্ট তথ্য সহায়তা করতে পারি।"],
        "gu-IN": ["હું બેલેન્સ, ટ્રાંઝેક્શન્સ, બિલ્સ અને એકાઉન્ટ તથ્યોમાં મદદ કરી શકું છું."],
      },
    }

    const keywords = {
      balance: ["balance", "शेष", "இருப்பு", "సమతుల్యత", "ಸમತೋಲನ", "शेष", "ব্যালেন্স", "બેલેન્સ"],
      savings: ["savings", "बचत", "சேமிப்பு", "సేవింగ్", "ಸಂಪದ", "बचत", "সঞ্চয়", "બચત"],
      transactions: ["transaction", "लेनदेन", "பரிமாற்றம்", "లెనదెన్", "ವಹಿವಾಟು", "लेनदेन", "লেনদে", "ટ્રાંઝેક્શન"],
      help: ["help", "सहाय", "உதவி", "సహాయ", "ಸహాಯ", "सहाय", "সাহায্য", "મદદ"],
    }

    if (keywords.balance.some((kw) => lowerMessage.includes(kw.toLowerCase()))) {
      return responses.balance[language]?.[0] || "I can help with your balance."
    } else if (keywords.savings.some((kw) => lowerMessage.includes(kw.toLowerCase()))) {
      return responses.savings[language]?.[0] || "I can help with your savings."
    } else if (keywords.transactions.some((kw) => lowerMessage.includes(kw.toLowerCase()))) {
      return responses.transactions[language]?.[0] || "I can help with your transactions."
    } else {
      return responses.help[language]?.[0] || "How can I help you?"
    }
  }

  const handleSend = () => {
    if (input.trim() === "") return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }
    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setIsLoading(true)

    setTimeout(() => {
      const botResponseContent = generateResponse(input, selectedLanguage, balance, savings, allTransactions, bills)
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botResponseContent,
      }
      setMessages((prevMessages) => [...prevMessages, newBotMessage])
      setIsLoading(false)
      setInput("")
    }, 1000)
  }

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value)
  }

  return (
    <div className="flex flex-col h-screen bg-background md:max-w-2xl md:mx-auto">
      <div className="p-3 md:p-4 bg-primary text-white flex justify-between items-center gap-2">
        <h2 className="text-base md:text-lg font-semibold truncate">Bank Assistant</h2>
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="text-black p-1.5 md:p-2 rounded-md text-xs md:text-sm flex-shrink-0"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-lg p-2.5 md:p-3 break-words text-sm md:text-base max-w-[85%] md:max-w-md ${
                message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="animate-pulse rounded-lg p-2.5 md:p-3 bg-gray-200 text-black text-sm md:text-base">...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2.5 md:p-4 border-t bg-background flex items-center gap-1.5 md:gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak..."
          className="flex-1 text-sm md:text-base h-9 md:h-10"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSend()
            }
          }}
        />
        <Button size="sm" onClick={handleSend} disabled={isLoading} className="md:size-auto">
          <Send className="h-4 md:h-5 w-4 md:w-5" />
        </Button>
        <Button
          size="sm"
          variant={isListening ? "default" : "outline"}
          onClick={handleMicClick}
          disabled={isLoading}
          className="md:size-auto"
        >
          <Mic className="h-4 md:h-5 w-4 md:w-5" />
        </Button>
      </div>
    </div>
  )
}
