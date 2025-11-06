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
  action?: {
    type: "send_money" | "pay_bill" | "request_money" | "add_savings"
    data?: any
    needsConfirmation?: boolean
  }
}

interface PendingAction {
  type: "send_money" | "pay_bill" | "request_money" | "add_savings"
  recipientName?: string
  amount: number
  billId?: number
  billName?: string
}

export default function FullScreenChatbot() {
  const { balance, savings, transactions: allTransactions, bills, sendMoney, payBill, requestMoney, addToSavings } =
    useAccount()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US")
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

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

  // Extract amount from text (handles various formats like "500", "500 rupees", "₹500", etc.)
  const extractAmount = (text: string): number | null => {
    // Match numbers with optional currency symbols
    const amountPattern = /(?:₹|rs|rupees?|inr)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:₹|rs|rupees?|inr)|\d+(?:[.,]\d+)?/gi
    const matches = text.match(amountPattern)
    if (matches) {
      const amountStr = matches[0].replace(/[₹rsinrupees,\s]/gi, "").replace(/\./g, "")
      const amount = parseInt(amountStr, 10)
      return isNaN(amount) ? null : amount
    }
    // Try to extract standalone numbers
    const numberPattern = /\b(\d{2,})\b/
    const numberMatch = text.match(numberPattern)
    if (numberMatch) {
      const amount = parseInt(numberMatch[1], 10)
      return isNaN(amount) ? null : amount
    }
    return null
  }

  // Extract recipient name from text
  const extractRecipient = (text: string): string | null => {
    const sendPattern = /(?:send|transfer|pay|give)\s+(?:to|money to|rupees? to)\s+([a-z]+(?:\s+[a-z]+)?)/i
    const match = text.match(sendPattern)
    if (match && match[1]) {
      return match[1].trim()
    }
    // Try to find a name after amount
    const afterAmountPattern = /₹?\d+\s+(?:to|for)\s+([a-z]+(?:\s+[a-z]+)?)/i
    const afterMatch = text.match(afterAmountPattern)
    if (afterMatch && afterMatch[1]) {
      return afterMatch[1].trim()
    }
    return null
  }

  // Detect transaction intent and parse details
  const detectTransactionIntent = (userMessage: string): PendingAction | null => {
    const lowerMessage = userMessage.toLowerCase()

    // Send money patterns
    if (
      lowerMessage.match(/send|transfer|pay|give/) &&
      !lowerMessage.match(/bill|request|add.*savings|save/)
    ) {
      const amount = extractAmount(userMessage)
      const recipient = extractRecipient(userMessage)

      if (amount && amount > 0) {
        return {
          type: "send_money",
          recipientName: recipient || "Unknown",
          amount,
        }
      }
    }

    // Pay bill patterns
    if (lowerMessage.match(/pay.*bill|bill.*pay|pay.*electricity|pay.*internet|pay.*water|pay.*mobile/)) {
      const amount = extractAmount(userMessage)
      const billName = lowerMessage.match(/(electricity|internet|water|mobile)/i)?.[0]

      if (billName) {
        const bill = bills.find(
          (b) => b.name.toLowerCase() === billName.toLowerCase() && b.status === "pending",
        )
        if (bill) {
          return {
            type: "pay_bill",
            amount: bill.amount,
            billId: bill.id,
            billName: bill.name,
          }
        }
      } else if (amount) {
        // Try to find bill by amount
        const bill = bills.find((b) => b.amount === amount && b.status === "pending")
        if (bill) {
          return {
            type: "pay_bill",
            amount: bill.amount,
            billId: bill.id,
            billName: bill.name,
          }
        }
      }
    }

    // Request money patterns
    if (lowerMessage.match(/request|ask.*for|money.*from/)) {
      const amount = extractAmount(userMessage)
      if (amount && amount > 0) {
        return {
          type: "request_money",
          recipientName: extractRecipient(userMessage) || "Friend",
          amount,
        }
      }
    }

    // Add to savings patterns
    if (lowerMessage.match(/save|add.*savings|transfer.*savings|move.*savings/)) {
      const amount = extractAmount(userMessage)
      if (amount && amount > 0) {
        return {
          type: "add_savings",
          amount,
        }
      }
    }

    return null
  }

  const generateResponse = (
    userMessage: string,
    language: string,
    currentBalance: number,
    currentSavings: number,
    currentTransactions: any[],
    currentBills: any[],
  ): { content: string; action?: PendingAction } => {
    const lowerMessage = userMessage.toLowerCase()

    // Check for transaction intent first
    const transactionIntent = detectTransactionIntent(userMessage)
    if (transactionIntent) {
      // Check if balance is sufficient
      if (
        (transactionIntent.type === "send_money" || transactionIntent.type === "pay_bill") &&
        currentBalance < transactionIntent.amount
      ) {
        return {
          content:
            language === "en-US"
              ? `Insufficient balance. You have ₹${currentBalance.toLocaleString()} but need ₹${transactionIntent.amount.toLocaleString()}.`
              : `Insufficient balance. You have ₹${currentBalance.toLocaleString()} but need ₹${transactionIntent.amount.toLocaleString()}.`,
        }
      }

      // Return confirmation message with action
      if (transactionIntent.type === "send_money") {
        return {
          content:
            language === "en-US"
              ? `I'll send ₹${transactionIntent.amount.toLocaleString()} to ${transactionIntent.recipientName}. Please confirm by typing "yes" or "confirm".`
              : `I'll send ₹${transactionIntent.amount.toLocaleString()} to ${transactionIntent.recipientName}. Please confirm.`,
          action: transactionIntent,
        }
      } else if (transactionIntent.type === "pay_bill") {
        return {
          content:
            language === "en-US"
              ? `I'll pay your ${transactionIntent.billName} bill of ₹${transactionIntent.amount.toLocaleString()}. Please confirm by typing "yes" or "confirm".`
              : `I'll pay your ${transactionIntent.billName} bill of ₹${transactionIntent.amount.toLocaleString()}. Please confirm.`,
          action: transactionIntent,
        }
      } else if (transactionIntent.type === "request_money") {
        return {
          content:
            language === "en-US"
              ? `I'll request ₹${transactionIntent.amount.toLocaleString()} from ${transactionIntent.recipientName}. Please confirm by typing "yes" or "confirm".`
              : `I'll request ₹${transactionIntent.amount.toLocaleString()} from ${transactionIntent.recipientName}. Please confirm.`,
          action: transactionIntent,
        }
      } else if (transactionIntent.type === "add_savings") {
        if (currentBalance < transactionIntent.amount) {
          return {
            content:
              language === "en-US"
                ? `Insufficient balance. You have ₹${currentBalance.toLocaleString()} but need ₹${transactionIntent.amount.toLocaleString()}.`
                : `Insufficient balance.`,
          }
        }
        return {
          content:
            language === "en-US"
              ? `I'll add ₹${transactionIntent.amount.toLocaleString()} to your savings. Please confirm by typing "yes" or "confirm".`
              : `I'll add ₹${transactionIntent.amount.toLocaleString()} to your savings. Please confirm.`,
          action: transactionIntent,
        }
      }
    }

    // Handle confirmation responses
    if (pendingAction && (lowerMessage === "yes" || lowerMessage === "confirm" || lowerMessage === "y")) {
      return { content: "" } // Will be handled in handleSend
    }
    if (pendingAction && (lowerMessage === "no" || lowerMessage === "cancel" || lowerMessage === "n")) {
      setPendingAction(null)
      return {
        content: language === "en-US" ? "Transaction cancelled." : "Transaction cancelled.",
      }
    }

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
      bills: {
        "en-US": [`You have ${currentBills.filter((b) => b.status === "pending").length} pending bills.`],
        "hi-IN": [`आपके पास ${currentBills.filter((b) => b.status === "pending").length} बकाया बिल हैं।`],
        "ta-IN": [`உங்களிடம் ${currentBills.filter((b) => b.status === "pending").length} நிலுவையில் உள்ள பில்கள் உள்ளன.`],
        "te-IN": [`మీకు ${currentBills.filter((b) => b.status === "pending").length} పెండింగ్ బిల్‌లు ఉన్నాయి.`],
        "kn-IN": [`ನೀವು ${currentBills.filter((b) => b.status === "pending").length} ಬಾಕಿ ಬಿಲ್‌ಗಳನ್ನು ಹೊಂದಿರುವಿರಿ.`],
        "mr-IN": [`आपल्याकडे ${currentBills.filter((b) => b.status === "pending").length} बकाया बिल आहेत.`],
        "bn-IN": [`আপনার কাছে ${currentBills.filter((b) => b.status === "pending").length} বকেয়া বিল রয়েছে।`],
        "gu-IN": [`તમારી પાસે ${currentBills.filter((b) => b.status === "pending").length} બાકી બિલ છે.`],
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
      bills: ["bill", "bills", "बिल", "பில்", "బిల్", "ಬಿಲ್", "বিল", "બિલ"],
      transactions: ["transaction", "लेनदेन", "பரிமாற்றம்", "లెనదెన్", "ವಹಿವಾಟು", "लेनदेन", "লেনদে", "ટ્રાંઝેક્શન"],
      help: ["help", "सहाय", "உதவி", "సహాయ", "ಸహాಯ", "सहाय", "সাহায্য", "મદદ"],
    }

    if (keywords.balance.some((kw) => lowerMessage.includes(kw.toLowerCase()))) {
      return { content: responses.balance[language]?.[0] || "I can help with your balance." }
    } else if (keywords.savings.some((kw) => lowerMessage.includes(kw.toLowerCase()))) {
      return { content: responses.savings[language]?.[0] || "I can help with your savings." }
    } else if (keywords.transactions.some((kw) => lowerMessage.includes(kw.toLowerCase()))) {
      return { content: responses.transactions[language]?.[0] || "I can help with your transactions." }
    } else if (keywords.bills.some((kw) => lowerMessage.includes(kw.toLowerCase()))) {
      return { content: responses.bills[language]?.[0] || "I can help with your bills." }
    } else {
      return { content: responses.help[language]?.[0] || "How can I help you?" }
    }
  }

  const executeTransaction = (action: PendingAction) => {
    try {
      switch (action.type) {
        case "send_money":
          if (action.recipientName && action.amount) {
            sendMoney(action.recipientName, action.amount)
            return `✅ Successfully sent ₹${action.amount.toLocaleString()} to ${action.recipientName}!`
          }
          break
        case "pay_bill":
          if (action.billId) {
            payBill(action.billId)
            return `✅ Successfully paid ${action.billName} bill of ₹${action.amount.toLocaleString()}!`
          }
          break
        case "request_money":
          if (action.recipientName && action.amount) {
            requestMoney(action.recipientName, action.amount)
            return `✅ Money request sent to ${action.recipientName} for ₹${action.amount.toLocaleString()}!`
          }
          break
        case "add_savings":
          if (action.amount) {
            addToSavings(action.amount)
            return `✅ Added ₹${action.amount.toLocaleString()} to your savings!`
          }
          break
      }
      return "Transaction completed."
    } catch (error) {
      return "Sorry, there was an error processing your transaction. Please try again."
    }
  }

  const handleSend = () => {
    if (input.trim() === "") return

    const userInput = input.trim()
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
    }
    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setIsLoading(true)

    // Handle confirmation
    const lowerInput = userInput.toLowerCase()
    if (pendingAction && (lowerInput === "yes" || lowerInput === "confirm" || lowerInput === "y")) {
      setTimeout(() => {
        const result = executeTransaction(pendingAction)
        const newBotMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result,
        }
        setMessages((prevMessages) => [...prevMessages, newBotMessage])
        setPendingAction(null)
        setIsLoading(false)
        setInput("")
      }, 1000)
      return
    }

    if (pendingAction && (lowerInput === "no" || lowerInput === "cancel" || lowerInput === "n")) {
      setTimeout(() => {
        const newBotMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Transaction cancelled.",
        }
        setMessages((prevMessages) => [...prevMessages, newBotMessage])
        setPendingAction(null)
        setIsLoading(false)
        setInput("")
      }, 500)
      return
    }

    setTimeout(() => {
      const response = generateResponse(userInput, selectedLanguage, balance, savings, allTransactions, bills)
      
      // If there's a pending action, store it
      if (response.action) {
        setPendingAction(response.action)
      }

      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        action: response.action,
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
