"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAccount } from "@/context/account-context" // import useAccount hook to get live data

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

// Define types for clarity if they are not globally available
interface Transaction {
  type: "sent" | "received"
  amount: number
  name?: string
  account?: string
  accountNumber?: string
  timestamp?: string
  date?: string
  time?: string
}

interface Bill {
  status: "pending" | "paid"
  amount: number
  description?: string
}

export default function BankChatbot() {
  const { balance, savings, transactions, bills } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US")
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Ensure speech recognition is initialized only once and managed correctly
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
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

    // Cleanup function to stop recognition when the component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [selectedLanguage]) // Re-initialize if language changes

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

  const handleMicClick = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop()
      } else {
        recognitionRef.current.lang = selectedLanguage // Ensure language is set
        recognitionRef.current.start()
      }
    }
  }

  const generateResponse = (
    userMessage: string,
    language: string,
    currentBalance: number,
    currentSavings: number,
    currentTransactions: Transaction[],
    currentBills: Bill[],
  ): string => {
    const lowerMessage = userMessage.toLowerCase()

    const responses: { [key: string]: { [lang: string]: string[] } } = {
      balance: {
        "en-US": [
          `Your current account balance is ₹${currentBalance.toLocaleString()}. You have ₹${Math.floor(currentBalance * 0.8).toLocaleString()} available for withdrawal.`,
          `Account balance: ₹${currentBalance.toLocaleString()}. Recent transactions have kept your balance stable this week.`,
          `Your balance is ₹${currentBalance.toLocaleString()}. We recommend maintaining a minimum balance of ₹10,000.`,
        ],
        "hi-IN": [
          `आपका वर्तमान खाता संतुलन ₹${currentBalance.toLocaleString()} है। आप ₹${Math.floor(currentBalance * 0.8).toLocaleString()} निकालने के लिए उपलब्ध है।`,
          `खाता संतुलन: ₹${currentBalance.toLocaleString()}। हाल के लेनदेन ने इस सप्ताह आपका संतुलन स्थिर रखा है।`,
          `आपका शेष ₹${currentBalance.toLocaleString()} है। हम न्यूनतम शेष ₹10,000 बनाए रखने की सलाह देते हैं।`,
        ],
        "ta-IN": [
          `உங்கள் தற்போதைய கணக்கு இருப்பு ₹${currentBalance.toLocaleString()} உள்ளது. நீங்கள் ₹${Math.floor(currentBalance * 0.8).toLocaleString()} திரும்பப் பெற முடியும்.`,
          `கணக்கு இருப்பு: ₹${currentBalance.toLocaleString()}। சமீபத்திய பரிமாற்றங்கள் இந்த வாரம் உங்கள் இருப்பை நிலையாக வைத்துள்ளன.`,
          `உங்கள் இருப்பு ₹${currentBalance.toLocaleString()} உள்ளது. குறைந்தபட்ச இருப்பு ₹10,000 பராமரிக்க பரிந்துரைக்கிறோம்.`,
        ],
        "te-IN": [
          `మీ ప్రస్తుత ఖాతా సమతుల్యత ₹${currentBalance.toLocaleString()} ఉంది. మీరు ₹${Math.floor(currentBalance * 0.8).toLocaleString()} ఉపసంహరించుకోవచ్చు.`,
          `ఖాతా సమతుల్యత: ₹${currentBalance.toLocaleString()} ఉంది. ఈ వారం ఇటీవలి లెనదేన్‌లు మీ సమతుల్యతను స్థిరంగా ఉంచాయి.`,
          `మీ సమతుల్యత ₹${currentBalance.toLocaleString()} ఉంది. కనీస సమతుల్యత ₹10,000 నిర్వహించాలని సిఫారసు చేస్తున్నాము.`,
        ],
        "kn-IN": [
          `ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಖಾತೆ ಸಮತೋಲನ ₹${currentBalance.toLocaleString()} ಉಂದು. ನೀವು ₹${Math.floor(currentBalance * 0.8).toLocaleString()} ಹಿಂತೆಗೆದುಕೊಳ್ಳಬಹುದು.`,
          `ಖಾತೆ ಸಮತೋಲನ: ₹${currentBalance.toLocaleString()} ಉಂದು. ಈ ವಾರ ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು ನಿಮ್ಮ ಸಮತೋಲನವನ್ನು ಸ್ಥಿರವಾಗಿ ಇಟ್ಟಿವೆ.`,
          `ನಿಮ್ಮ ಸಮತೋಲನ ₹${currentBalance.toLocaleString()} ಉಂದು. ಕನಿಷ್ಠ ಸಮತೋಲನ ₹10,000 ನಿರ್ವಹಿಸಲು ನಾವು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ.`,
        ],
        "mr-IN": [
          `आपल्या सध्याच्या खाते शेष ₹${currentBalance.toLocaleString()} आहे. आप ₹${Math.floor(currentBalance * 0.8).toLocaleString()} मिळवू शकता.`,
          `खाते शेष: ₹${currentBalance.toLocaleString()} आहे. अलीकडील व्यवहारांनी या आठवड्यात आपला शेष स्थिर ठेवला आहे.`,
          `आपला शेष ₹${currentBalance.toLocaleString()} आहे. आम्ही किमान शेष ₹10,000 राखण्याची शिफारस करतो.`,
        ],
        "bn-IN": [
          `আপনার বর্তমান অ্যাকাউন্ট ব্যালেন্স ₹${currentBalance.toLocaleString()}। আপনি ₹${Math.floor(currentBalance * 0.8).toLocaleString()} উত্তোলন করতে পারেন।`,
          `অ্যাকাউন্ট ব্যালেন্স: ₹${currentBalance.toLocaleString()}। সম্প্রতিকালীন লেনদেনগুলি এই সপ্তাহে আপনার ব্যালেন্স স্থিতিশীল রেখেছে।`,
          `আপনার ব্যালেন্স ₹${currentBalance.toLocaleString()}। আমরা ন্যূনতম ব্যালেন্স ₹10,000 বজায় রাখার পরামর্শ দিই।`,
        ],
        "gu-IN": [
          `તમારા હાલના ખાતા બેલેન્સ ₹${currentBalance.toLocaleString()} છે। તમે ₹${Math.floor(currentBalance * 0.8).toLocaleString()} ઉપાડી શકો છો.`,
          `ખાતા બેલેન્સ: ₹${currentBalance.toLocaleString()} છે। તાજેતરના વ્યવહારોએ આ સપ્તાહે તમારો બેલેન્સ સ્થિર રાખ્યો છે.`,
          `તમારો બેલેન્સ ₹${currentBalance.toLocaleString()} છે. આમે ન્યૂનતમ બેલેન્સ ₹10,000 જાળવી રાખવાની ભલામણ કરીએ છીએ.`,
        ],
      },
      savings: {
        "en-US": [
          `Your current savings are ₹${currentSavings.toLocaleString()}. Keep saving to reach your goal!`,
          `Savings balance: ₹${currentSavings.toLocaleString()}. You've saved well this month.`,
          `You have ₹${currentSavings.toLocaleString()} in your savings account. Consider setting a savings goal.`,
        ],
        "hi-IN": [
          `आपकी वर्तमान बचत ₹${currentSavings.toLocaleString()} है। अपने लक्ष्य तक पहुँचने के लिए बचत जारी रखें!`,
          `बचत संतुलन: ₹${currentSavings.toLocaleString()}। आपने इस महीने अच्छी बचत की है।`,
          `आपके बचत खाते में ₹${currentSavings.toLocaleString()} है। एक बचत लक्ष्य निर्धारित करने पर विचार करें।`,
        ],
        "ta-IN": [
          `உங்கள் தற்போதைய சேமிப்பு ₹${currentSavings.toLocaleString()} உள்ளது. உங்கள் இலக்கை அடைய சேமிக்கவும்!`,
          `சேமிப்பு இருப்பு: ₹${currentSavings.toLocaleString()} உள்ளது. இந்த மாதம் நன்றாக சேமித்துள்ளீர்கள்.`,
          `உங்கள் சேமிப்பு கணக்கில் ₹${currentSavings.toLocaleString()} உள்ளது. சேமிப்பு இலக்கை நிர்ணயிக்க கருத்தில் கொள்ளுங்கள்.`,
        ],
        "te-IN": [
          `మీ ప్రస్తుత సేవింగ్‌లు ₹${currentSavings.toLocaleString()} ఉంది. మీ లక్ష్యాన్ని చేరుకోవడానికి సేవింగ్ చేయండి!`,
          `సేవింగ్ సమతుల్యత: ₹${currentSavings.toLocaleString()} ఉంది. ఈ నెలలో నిండా సేవింగ్ చేసారు.`,
          `మీ సేవింగ్ ఖాతాలో ₹${currentSavings.toLocaleString()} ఉంది. సేవింగ్ లక్ష్యాన్ని నిర్ధారించటను పరిగణించండి.`,
        ],
        "kn-IN": [
          `ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸಂಪದ ₹${currentSavings.toLocaleString()} ಉಂದು. ನಿಮ್ಮ ಗುರಿಯನ್ನು ಸಾಧಿಸಲು ಉಳಿತೊಡಕು ಮಾಡುವುದನ್ನು ಮುಂದುವರಿಸಿ!`,
          `ಉಳಿತೊಡಕು ಸಮತೋಲನ: ₹${currentSavings.toLocaleString()} ಉಂದು. ಈ ತಿಂಗಳು ಚೆನ್ನಾಗಿ ಉಳಿತೊಡಕು ಮಾಡಿರುವಿರಿ.`,
          `ನಿಮ್ಮ ಉಳಿತೊಡಕು ಖಾತೆಯಲ್ಲಿ ₹${currentSavings.toLocaleString()} ಉಂದು. ಉಳಿತೊಡಕು ಗುರಿ ನಿರ್ಧರಿಸುವುದನ್ನು ಪರಿಗಣಿಸಿ.`,
        ],
        "mr-IN": [
          `आपल्या सध्याच्या बचत ₹${currentSavings.toLocaleString()} आहे. आपले लक्ष्य साधण्यासाठी बचत करा!`,
          `बचत शेष: ₹${currentSavings.toLocaleString()} आहे. आपने या महिन्यात चांगली बचत केली आहे.`,
          `आपल्या बचत खात्यात ₹${currentSavings.toLocaleString()} आहे. बचत लक्ष्य निर्धारित करण्याचा विचार करा.`,
        ],
        "bn-IN": [
          `আপনার বর্তমান সঞ্চয় ₹${currentSavings.toLocaleString()}। আপনার লক্ষ্য অর্জনের জন্য সঞ্চয় চালিয়ে যান!`,
          `সঞ্চয় ব্যালেন্স: ₹${currentSavings.toLocaleString()}। আপনি এই মাসে ভাল সঞ্চয় করেছেন।`,
          `আপনার সঞ্চয় অ্যাকাউন্টে ₹${currentSavings.toLocaleString()} রয়েছে। সঞ্চয় লক্ষ্য নির্ধারণ করার কথা বিবেচনা করুন।`,
        ],
        "gu-IN": [
          `મારી હાલની બચત ₹${currentSavings.toLocaleString()} છે. તમારા લક્ષ્યને પ્રાપ્ત કરવા માટે બચત કરો!`,
          `બચત બેલેન્સ: ₹${currentSavings.toLocaleString()} છે. તમે આ મહિને સારી બચત કરી છે.`,
          `તમારા બચત ખાતામાં ₹${currentSavings.toLocaleString()} છે. બચત લક્ષ્ય નક્કી કરવાનો વિચાર કરો.`,
        ],
      },
      transactions: {
        "en-US": [
          `You have ${currentTransactions.length} recent transactions. Latest: ${currentTransactions[0]?.type === "sent" ? "Sent" : "Received"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "to" : "from"} ${currentTransactions[0]?.name} today at ${currentTransactions[0]?.time}.`,
          `Recent activity: ${currentTransactions[0]?.type === "sent" ? "Sent" : "Received"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "to" : "from"} ${currentTransactions[0]?.name}.`,
        ],
        "hi-IN": [
          `आपके पास ${currentTransactions.length} हाल के लेनदेन हैं। नवीनतम: ${currentTransactions[0]?.type === "sent" ? "आज भेजा" : "आज प्राप्त किया"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "को" : "से"} ${currentTransactions[0]?.name}।`,
          `हाल की गतिविधि: ${currentTransactions[0]?.type === "sent" ? "भेजा" : "प्राप्त किया"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "को" : "से"} ${currentTransactions[0]?.name}।`,
        ],
        "ta-IN": [
          `உங்களிடம் ${currentTransactions.length} சமீபத்திய பரிமாற்றங்கள் உள்ளன. சமீபத்திய: ${currentTransactions[0]?.type === "sent" ? "இன்று அனுப்பப்பட்டது" : "இன்று பெறப்பட்டது"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "க்கு" : "இலிருந்து"} ${currentTransactions[0]?.name}.`,
          `சமீபத்திய செயல்பாடு: ${currentTransactions[0]?.type === "sent" ? "அனுப்பப்பட்டது" : "பெறப்பட்டது"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "க்கு" : "இலிருந்து"} ${currentTransactions[0]?.name}.`,
        ],
        "te-IN": [
          `మీకు ${currentTransactions.length} ఇటీవలి లెనదేన్‌లు ఉన్నాయి. సమీపకాలం: ${currentTransactions[0]?.type === "sent" ? "ఈరోజు పంపించబడింది" : "ఈరోజు పొందిన"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "కు" : "నుండి"} ${currentTransactions[0]?.name}.`,
          `ఇటీవలి కార్యకలాపం: ${currentTransactions[0]?.type === "sent" ? "పంపించబడింది" : "పొందిన"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "కు" : "నుండి"} ${currentTransactions[0]?.name}.`,
        ],
        "kn-IN": [
          `ನೀವು ${currentTransactions.length} ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳನ್ನು ಹೊಂದಿರುವಿರಿ. ಇತ್ತೀಚಿನ: ${currentTransactions[0]?.type === "sent" ? "ಇಂದು ಕಳುಹಿಸಲಾಗಿದೆ" : "ಇಂದು ಪಡೆದ"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "ಗೆ" : "ನಿಂದ"} ${currentTransactions[0]?.name}.`,
          `ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ: ${currentTransactions[0]?.type === "sent" ? "ಕಳುಹಿಸಲಾಗಿದೆ" : "ಪಡೆದ"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "ಗೆ" : "ನಿಂದ"} ${currentTransactions[0]?.name}.`,
        ],
        "mr-IN": [
          `आपल्याकडे ${currentTransactions.length} अलीकडील व्यवहार आहेत. सर्वशेष: ${currentTransactions[0]?.type === "sent" ? "आज पाठविले" : "आज प्राप्त"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "ला" : "कडून"} ${currentTransactions[0]?.name}.`,
          `अलीकडील क्रियाकलाप: ${currentTransactions[0]?.type === "sent" ? "पाठविले" : "प्राप्त"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "ला" : "कडून"} ${currentTransactions[0]?.name}.`,
        ],
        "bn-IN": [
          `আপনার কাছে ${currentTransactions.length} সম্প্রতিকালীন লেনদেন রয়েছে। সর্বশেষ: ${currentTransactions[0]?.type === "sent" ? "আজ পাঠানো হয়েছে" : "আজ পাওয়া গেছে"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "কে" : "থেকে"} ${currentTransactions[0]?.name}।`,
          `সম্প্রতিকালীন কার্যকলাপ: ${currentTransactions[0]?.type === "sent" ? "পাঠানো হয়েছে" : "পাওয়া গেছে"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "কে" : "থেকে"} ${currentTransactions[0]?.name}।`,
        ],
        "gu-IN": [
          `તમારી પાસે ${currentTransactions.length} તાજેતરના વ્યવહાર છે. તાજેતમ: ${currentTransactions[0]?.type === "sent" ? "આજે મોકલ્યું" : "આજે પ્રાપ્ત"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "ને" : "પાસેથી"} ${currentTransactions[0]?.name}.`,
          `તાજેતરની પ્રવૃત્તિ: ${currentTransactions[0]?.type === "sent" ? "મોકલ્યું" : "પ્રાપ્ત"} ₹${currentTransactions[0]?.amount} ${currentTransactions[0]?.type === "sent" ? "ને" : "પાસેથી"} ${currentTransactions[0]?.name}.`,
        ],
      },
      "last transaction": {
        "en-US": [
          `Your last transaction was on ${currentTransactions[0]?.date}: Sent ₹${currentTransactions[0]?.amount} to ${currentTransactions[0]?.name}.`,
          `Most recent: ${currentTransactions[0]?.date} at ${currentTransactions[0]?.time} - ₹${currentTransactions[0]?.amount} transferred.`,
        ],
        "hi-IN": [
          `आपका अंतिम लेनदेन ${currentTransactions[0]?.date} पर था: ${currentTransactions[0]?.name} को ₹${currentTransactions[0]?.amount} भेजा।`,
          `सबसे हाल: ${currentTransactions[0]?.date} ${currentTransactions[0]?.time} पर - ₹${currentTransactions[0]?.amount} हस्तांतरित।`,
        ],
        "ta-IN": [
          `உங்கள் கடைசி பரிமாற்றம் ${currentTransactions[0]?.date} இல் இருந்தது: ${currentTransactions[0]?.name}க்கு ₹${currentTransactions[0]?.amount} அனுப்பப்பட்டது.`,
          `மிகச்சமீபத்திய: ${currentTransactions[0]?.date} ${currentTransactions[0]?.time} - ₹${currentTransactions[0]?.amount} மாற்றப்பட்டது.`,
        ],
        "te-IN": [
          `మీ చివరి లెనదెన ${currentTransactions[0]?.date} నుండి: ${currentTransactions[0]?.name}కు ₹${currentTransactions[0]?.amount} పంపించబడింది.`,
          `ఇటీవలీ: ${currentTransactions[0]?.date} ${currentTransactions[0]?.time} - ₹${currentTransactions[0]?.amount} బదిలీ చేయబడింది.`,
        ],
        "kn-IN": [
          `ನಿಮ್ಮ ಕೊನೆಯ ವಹಿವಾಟು ${currentTransactions[0]?.date} ನಲ್ಲಿತ್ತು: ${currentTransactions[0]?.name}ಗೆ ₹${currentTransactions[0]?.amount} ಕಳುಹಿಸಲಾಗಿದೆ.`,
          `ಇತ್ತೀಚಿನ: ${currentTransactions[0]?.date} ${currentTransactions[0]?.time} - ₹${currentTransactions[0]?.amount} ವರ್ಗಾಯಿಸಲಾಗಿದೆ.`,
        ],
        "mr-IN": [
          `आपला अंतिम व्यवहार ${currentTransactions[0]?.date} वर होता: ${currentTransactions[0]?.name} ला ₹${currentTransactions[0]?.amount} पाठविले.`,
          `सर्वात अलीकडी: ${currentTransactions[0]?.date} ${currentTransactions[0]?.time} - ₹${currentTransactions[0]?.amount} हस्तांतरित.`,
        ],
        "bn-IN": [
          `আপনার শেষ লেনদেন ছিল ${currentTransactions[0]?.date} এ: ${currentTransactions[0]?.name}কে ₹${currentTransactions[0]?.amount} পাঠানো হয়েছিল.`,
          `সবচেয়ে সম্প্রতিক: ${currentTransactions[0]?.date} ${currentTransactions[0]?.time} - ₹${currentTransactions[0]?.amount} স্থানান্তরিত.`,
        ],
        "gu-IN": [
          `તમારી છેલ્લી ક્રિયા ${currentTransactions[0]?.date} પર હતી: ${currentTransactions[0]?.name}ને ₹${currentTransactions[0]?.amount} મોકલ્યું.`,
          `સૌથી તાજું: ${currentTransactions[0]?.date} ${currentTransactions[0]?.time} - ₹${currentTransactions[0]?.amount}નું સ્થાનાંતરણ.`,
        ],
      },
      received: {
        "en-US": [
          `Latest received: ₹${currentTransactions[1]?.amount} from ${currentTransactions[1]?.name} on ${currentTransactions[1]?.date}.`,
        ],
        "hi-IN": [
          `सबसे नया प्राप्त: ${currentTransactions[1]?.date} पर ${currentTransactions[1]?.name} से ₹${currentTransactions[1]?.amount}।`,
        ],
        "ta-IN": [
          `சமீபத்திய பெறப்பட்டது: ${currentTransactions[1]?.date} இல் ${currentTransactions[1]?.name} இலிருந்து ₹${currentTransactions[1]?.amount}.`,
        ],
        "te-IN": [
          `సమీపకాలం పొందిన: ${currentTransactions[1]?.date} నుండి ${currentTransactions[1]?.name} నుండి ₹${currentTransactions[1]?.amount}.`,
        ],
        "kn-IN": [
          `ಇತ್ತೀಚಿನ ಪಡೆದ: ${currentTransactions[1]?.date} ನಲ್ಲಿ ${currentTransactions[1]?.name} ನಿಂದ ₹${currentTransactions[1]?.amount}.`,
        ],
        "mr-IN": [
          `सर्वशेष प्राप्त: ${currentTransactions[1]?.date} पर ${currentTransactions[1]?.name} कडून ₹${currentTransactions[1]?.amount}।`,
        ],
        "bn-IN": [
          `সর্বশেষ প্রাপ্ত: ${currentTransactions[1]?.date} এ ${currentTransactions[1]?.name} থেকে ₹${currentTransactions[1]?.amount}।`,
        ],
        "gu-IN": [
          `તાજેતમ પ્રાપ્ત: ${currentTransactions[1]?.date} ને ${currentTransactions[1]?.name} પાસેથી ₹${currentTransactions[1]?.amount}.`,
        ],
      },
      sent: {
        "en-US": [
          `Your latest sent transaction: ₹${currentTransactions[0]?.amount} to ${currentTransactions[0]?.name} on ${currentTransactions[0]?.date}.`,
        ],
        "hi-IN": [
          `आपका नवीनतम भेजा गया लेनदेन: ${currentTransactions[0]?.date} पर ${currentTransactions[0]?.name} को ₹${currentTransactions[0]?.amount}।`,
        ],
        "ta-IN": [
          `உங்கள் சமீபத்திய அனுப்ப பரிமாற்றம்: ${currentTransactions[0]?.date} இல் ${currentTransactions[0]?.name}க்கு ₹${currentTransactions[0]?.amount}.`,
        ],
        "te-IN": [
          `మీ సమీపకాలం పంపిన లెనదెన: ${currentTransactions[0]?.date} నుండి ${currentTransactions[0]?.name}కు ₹${currentTransactions[0]?.amount}.`,
        ],
        "kn-IN": [
          `ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಕಳುಹಿಸಿದ ವಹಿವಾಟು: ${currentTransactions[0]?.date} ನಲ್ಲಿ ${currentTransactions[0]?.name}ಗೆ ₹${currentTransactions[0]?.amount}.`,
        ],
        "mr-IN": [
          `आपला अलीकडील पाठविलेला व्यवहार: ${currentTransactions[0]?.date} पर ${currentTransactions[0]?.name} ला ₹${currentTransactions[0]?.amount}.`,
        ],
        "bn-IN": [
          `আপনার সর্বশেষ পাঠানো লেনদেন: ${currentTransactions[0]?.date} এ ${currentTransactions[0]?.name}কে ₹${currentTransactions[0]?.amount}।`,
        ],
        "gu-IN": [
          `તમારું તાજેતમ મોકલ્યું વ્યવહાર: ${currentTransactions[0]?.date} ને ${currentTransactions[0]?.name}ને ₹${currentTransactions[0]?.amount}.`,
        ],
      },
      bills: {
        "en-US": [
          `You have ${currentBills.filter((b) => b.status === "pending").length} pending bills totaling ₹${currentBills
            .filter((b) => b.status === "pending")
            .reduce((sum, b) => sum + b.amount, 0)
            .toLocaleString()}.`,
        ],
        "hi-IN": [
          `आपके पास ${currentBills.filter((b) => b.status === "pending").length} बिल हैं कुल ₹${currentBills
            .filter((b) => b.status === "pending")
            .reduce((sum, b) => sum + b.amount, 0)
            .toLocaleString()} के।`,
        ],
        "ta-IN": [
          `உங்களிடம் ${currentBills.filter((b) => b.status === "pending").length} நிலுவை பில்கள் உள்ளன, மொத்தம் ₹${currentBills
            .filter((b) => b.status === "pending")
            .reduce((sum, b) => sum + b.amount, 0)
            .toLocaleString()}.`,
        ],
        "te-IN": [
          `మీకు ${currentBills.filter((b) => b.status === "pending").length} పెండింగ్ బిల్లులు ఉన్నాయి, మొత్తం ₹${currentBills
            .filter((b) => b.status === "pending")
            .reduce((sum, b) => sum + b.amount, 0)
            .toLocaleString()}.`,
        ],
        "kn-IN": [
          `ನಿಮ್ಮ ಬಳಿ ${currentBills.filter((b) => b.status === "pending").length} ಬಾಕಿ ಬಿಲ್‌ಗಳು ಇವೆ, ಒಟ್ಟು ₹${currentBills
            .filter((b) => b.status === "pending")
            .reduce((sum, b) => sum + b.amount, 0)
            .toLocaleString()}.`,
        ],
        "mr-IN": [
          `आपल्याकडे ${currentBills.filter((b) => b.status === "pending").length} बिल आहेत, एकूण ₹${currentBills
            .filter((b) => b.status === "pending")
            .reduce((sum, b) => sum + b.amount, 0)
            .toLocaleString()}.`,
        ],
        "bn-IN": [
          `আপনার কাছে ${currentBills.filter((b) => b.status === "pending").length} বকেয়া বিল রয়েছে, মোট ₹${currentBills
            .filter((b) => b.status === "pending")
            .reduce((sum, b) => sum + b.amount, 0)
            .toLocaleString()}.`,
        ],
        "gu-IN": [
          `તમારી પાસે ${currentBills.filter((b) => b.status === "pending").length} બાકી બિલ છે, કુલ ₹${currentBills
            .filter((b) => b.status === "pending")
            .reduce((sum, b) => sum + b.amount, 0)
            .toLocaleString()}.`,
        ],
      },
      "card details": {
        "en-US": [
          "Demo Card: 4532-1234-5678-9012, CVV: 847, Expiry: 12/26",
          "Card ending in 9012, Valid thru 12/26, CVV: 847",
        ],
        "hi-IN": [
          "डेमो कार्ड: 4532-1234-5678-9012, CVV: 847, समाप्ति: 12/26",
          "कार्ड 9012 में समाप्त होता है, 12/26 तक वैध, CVV: 847",
        ],
        "ta-IN": [
          "டெமோ கார்ட்: 4532-1234-5678-9012, CVV: 847, காலாவதி: 12/26",
          "கார் ஡ோ 9012 இல் முடிவடைகிறது, 12/26 வரை செல்லுபடியாகும், CVV: 847",
        ],
        "te-IN": [
          "డెమో కార్డ్: 4532-1234-5678-9012, CVV: 847, గడువు: 12/26",
          "కార్డ్ 9012 లో ముగుస్తుంది, 12/26 వరకు చెల్లుబాటు, CVV: 847",
        ],
        "kn-IN": [
          "ಡೆಮೋ ಕಾರ್ಡ್: 4532-1234-5678-9012, CVV: 847, ಮುಕ್ತಾಯ: 12/26",
          "ಕಾರ್ಡ್ 9012 ರಲ್ಲಿ ಕೊನೆಗೊಳ್ಳುತ್ತದೆ, 12/26 ರವರೆಗೆ ಮಾನ್ಯ, CVV: 847",
        ],
        "mr-IN": [
          "डेमो कार्ड: 4532-1234-5678-9012, CVV: 847, समाप्ति: 12/26",
          "कार्ड 9012 मध्ये समाप्त होतो, 12/26 पर्यंत वैध, CVV: 847",
        ],
        "bn-IN": [
          "ডেমো কার্ড: 4532-1234-5678-9012, CVV: 847, মেয়াদ শেষ: 12/26",
          "কার্ড 9012 এ শেষ হয়, 12/26 পর্যন্ত বৈধ, CVV: 847",
        ],
        "gu-IN": [
          "ડેમો કાર્ડ: 4532-1234-5678-9012, CVV: 847, સમાપ્તિ: 12/26",
          "કાર્ડ 9012 માં સમાપ્ત થાય છે, 12/26 સુધી માન્ય, CVV: 847",
        ],
      },
      account: {
        "en-US": [
          "Account number is 5847291564, IFSC: MYBNK0001. Account type: Savings.",
          "Account: MYBNK Savings Account (5847291564), Opened 2 years ago.",
        ],
        "hi-IN": [
          "खाता संख्या 5847291564 है, IFSC: MYBNK0001। खाता प्रकार: बचत।",
          "खाता: MYBNK बचत खाता (5847291564), 2 साल पहले खोला गया।",
        ],
        "ta-IN": [
          "கணக்கு எண் 5847291564, IFSC: MYBNK0001। கணக்கு வகை: சேமிப்பு।",
          "கணக்கு: MYBNK சேமிப்பு கணக்கு (5847291564), 2 ஆண்டுகளுக்கு முன் திறக்கப்பட்டது।",
        ],
        "te-IN": [
          `ఖాతా సంఖ్య 5847291564, IFSC: MYBNK0001. ఖాతా రకం: సేవింగ్.`,
          `ఖాతా: MYBNK సేవింగ్ ఖాతా (5847291564), 2 సంవత్సరాల ముందు తెరవబడింది.`,
        ],
        "kn-IN": [
          `ಖಾತೆ ಸಂಖ್ಯೆ 5847291564, IFSC: MYBNK0001. ಖಾತೆ ವಿಧ: ಉಳಿತೊಡಕು.`,
          `ಖಾತೆ: MYBNK ಉಳಿತೊಡಕು ಖಾತೆ (5847291564), 2 ವರ್ಷಗಳ ಹಿಂದೆ ತೆರೆಯಲಾಗಿತ್ತು.`,
        ],
        "mr-IN": [
          `खाते क्रमांक 5847291564, IFSC: MYBNK0001. खाते प्रकार: बचत.`,
          `खाते: MYBNK बचत खाते (5847291564), 2 वर्षांपूर्वी खुले.`,
        ],
        "bn-IN": [
          `অ্যাকাউন্ট নম্বর 5847291564, IFSC: MYBNK0001। অ্যাকাউন্ট প্রকার: সঞ্চয়।`,
          `অ্যাকাউন্ট: MYBNK সঞ্চয় অ্যাকাউন্ট (5847291564), 2 বছর আগে খোলা।`,
        ],
        "gu-IN": [
          `ખાતો નંબર 5847291564, IFSC: MYBNK0001. ખાતો પ્રકાર: બચત.`,
          `ખાતો: MYBNK બચત ખાતો (5847291564), 2 વર્ષ પહેલાં ખોલ્યું.`,
        ],
      },
      send: {
        "en-US": [
          "To send money, enter the recipient name, amount, and description. Your transfer will be processed instantly.",
          "Send money feature allows transfers up to ₹1,00,000 per day. Recipient will receive funds within minutes.",
        ],
        "hi-IN": [
          "पैसे भेजने के लिए, प्राप्तकर्ता का नाम, राशि और विवरण दर्ज करें। आपका स्थानांतરण तुरंत संसाधित होगा।",
          "पैसे भेजने की सुविधा प्रति दिन ₹1,00,000 तक हस्तांतरण की अनुमति देती है।",
        ],
        "ta-IN": [
          "பணம் அனுப்ப, பெறுநரின் பெயர், தொகை மற்றும் விளக்கத்தை உள்ளிடவும்। உங்கள் பரிமாற்றம் உடனடியாக செயல்படுத்தப்படும்.",
          "பணம் அனுப்பும் அம்சம் நாளொன்றுக்கு ₹1,00,000 வரை பரிமாற்றத்தை அனுமதிக்கிறது.",
        ],
        "te-IN": [
          "డబ్బు పంపడానికి, గ్రహీతకు పేరు, సంఖ్య మరియు వివరణను నమోదు చేయండి. మీ బదిలీ తక్షణమే ప్రక్రియ చేయబడుతుంది.",
          "డబ్బు పంపే ఫీచర్ రోజుకు ₹1,00,000 వరకు బదిలీని అనుమతిస్తుంది.",
        ],
        "kn-IN": [
          "ಹಣ ಕಳುಹಿಸಲು, ಪಡೆದುಕೊಳ್ಳುವವರ ಹೆಸರು, ಮೊತ್ತ ಮತ್ತು ವಿವರಣೆ ನಮೂದಿಸಿ. ನಿಮ್ಮ ವರ್ಗಾಯಿಸುವಿಕೆ ತಕ್ಷಣ ಪ್ರಕ್ರಿಯೆಗೊಳ್ುತ್ತದೆ.",
          "ಹಣ ಕಳುಹಿಸುವ ವೈಶಿಷ್ಟ್ಯವು ಪ್ರತಿದಿನ ₹1,00,000 ವರೆಗೆ ವರ್ಗಾಯಿಸುವಿಕೆಯನ್ನು ಅನುಮತಿಸುತ್ತದೆ.",
        ],
        "mr-IN": [
          "पैसे पाठवायचे तर प्राप्तकर्त्याचे नाम, रक्कम आणि वर्णन प्रविष्ट करा. आपला हस्तांतરण तत्काळ प्रक्रिया केला जाईल.",
          "पैसे पाठवण्याची सुविधा प्रतिदिन ₹1,00,000 पर्यंत हस्तांतરण अनुमती देते.",
        ],
        "bn-IN": [
          "অর্থ পাঠাতে, প্রাপকের নাম, পরিমাণ এবং বর্ণনা প্রবেশ করুন। আপনার স্থানান্তর তাত্ক্ষণিকভাবে প্রক্রিয়া করা হবে।",
          "অর্থ পাঠানো বৈশিষ্ট্য প্রতিদিন ₹1,00,000 পর্যন্ত স্থানান্তർ অনুমতি দেয়।",
        ],
        "gu-IN": [
          "પૈસા મોકલવા માટે, પ્રાપ્તકર્તાનું નામ, રકમ અને વર્ણન દાખલ કરો. તમારું ટ્રાન્સફર તાત્ક્ષણિક પ્રક્રિયા થશે.",
          "પૈસા મોકલવાની સુવિધા દૈનિક ₹1,00,000 સુધીના ટ્રાન્સફર ની મંજૂરી આપે છે.",
        ],
      },
      help: {
        "en-US": [
          "I can help with balance inquiries, transactions, bills, card details, and account information.",
          "Ask me about your balance, recent transactions, pending bills, or how to send money.",
        ],
        "hi-IN": [
          "मैं शेष पूछताछ, लेनदेन, बिल, कार्ड विवरण और खाता जानकारी में मदद कर सकता हूं।",
          "मुझसे अपने शेष, हाल के लेनदेन, बिल या पैसे भेजने के बारे में पूछें।",
        ],
        "ta-IN": [
          "நான் இருப்பு, பரிமாற்றங்கள், பில்கள், கார்D விவரங்கள் மற்றும் கணக்கு தகவல்களை உதவ முடிகிறது।",
          "உங்கள் இருப்பு, பரிமாற்றங்கள், பில்கள் அல்லது பணம் பற்றி என்னை கேளுங்கள்.",
        ],
        "te-IN": [
          "నేను బ్యాలెన్స్, లెనదెన్‌లు, బిల్‌లు, కార్డ్ వివరాలు మరియు ఖాతా సమాచారానికి సహాయ చేయగలను.",
          "మీ బ్యాలెన్స్, లెనదెన్‌లు, బిల్‌లు లేదా డబ్బు గురించి నన్నను అడగండి.",
        ],
        "kn-IN": [
          "ನಾನು ಬ್ಯಾಲೆನ್ಸ್, ವಹಿವಾಟುಗಳು, ಬಿಲ್‌ಗಳು, ಕಾರ್ಡ್ ವಿವರಗಳು ಮತ್ತು ಖಾತೆ ಮಾಹಿತಿಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು.",
          "ನಿಮ್ಮ ಬ್ಯಾಲೆನ್ಸ್, ವಹಿವಾಟುಗಳು, ಬಿಲ್‌ಗಳು ಅಥವಾ ಹಣ ಕುರಿತು ನನ್ನನ್ನು ಕೇಳಿ.",
        ],
        "mr-IN": [
          "मैं शेष, व्यवहार, बिल, कार्ड विवरण और खाता जानकारी में मदद कर सकता हूं।",
          "मुझसे आपके शेष, व्यवहार, बिल या पैसे के बारे में पूछें।",
        ],
        "bn-IN": [
          "আমি ব্যালেন্স, লেনদেন, বিল, কার্ড বিবরণ এবং অ্যাকাউন্ট তথ্য সহায়তা করতে পারি।",
          "আপনার ব্যালেন্স, লেনদেন, বিল বা অর্থ সম্পর্কে আমাকে জিজ্ঞাসা করুন।",
        ],
        "gu-IN": [
          "હું બેલેન્સ, ટ્રાંઝેક્શન્સ, બિલ્સ, કાર્ડ વિગતો અને એકાઉન્ટ તથ્યોમાં મદદ કરી શકું છું.",
          "તમારા બેલેન્સ, ટ્રાંઝેક્શન્સ, બિલ્સ અથવા પૈસા વિશે મને પૂછો.",
        ],
      },
    }

    const kannada_keywords = {
      balance: ["ಮಿತಿ", "ಸಮತೋಲನ", "ಖಾತೆ", "ಬ್ಯಾಲೆನ್ಸ"],
      savings: ["ಉಳಿತೊಡಕು", "ಸಂಪದ", "ಉಳಿತೊಡುಕು"],
      transaction: ["ವಹಿವಾಟು", "ವಹಿವಾಟುಗಳು", "ವರ್ಗಾಯಿತು"],
      received: ["ಪಡೆದ", "ಸ್ವೀಕರಿಸಿದ", "ಪಾವತಿ"],
      sent: ["ಕಳುಹಿಸಿದ", "ಪಠಾಯಿಸಿದ", "ಹಿಂತೆಗೆದುಕೊಂಡ"],
      bills: ["ಬಿಲ್", "ಬಿಲ್‌ಗಳು", "ಬಾಕಿ"],
      card: ["ಕಾರ್ಡ್", "ಕಾರ್ಡ್ ವಿವರ"],
      account: ["ಖಾತೆ", "ಖಾತೆ ಸಂಖ್ಯೆ"],
      send: ["ಕಳುಹಿಸಿ", "ಪಾವತಿ", "ವರ್ಗಾಯಿಸಿ"],
      help: ["ಸಹಾಯ", "ಮಾಹಿತಿ", "ಸೂಚನೆ"],
    }

    const hindi_keywords = {
      balance: ["बalance", "शेष", "बैलेंस"],
      savings: ["बचत", "संचय"],
      transaction: ["लेनदेन", "व्यवहार"],
      received: ["प्राप्त", "प्राप्ति"],
      sent: ["भेजा", "भेजा गया"],
      bills: ["बिल", "बिल देणे"],
      card: ["कार्ड", "कार्ड विवरण"],
      account: ["खाता", "अकाउंट"],
      send: ["भेजा", "पाठवा"],
      help: ["सहाय", "सहायता"],
    }

    const telugu_keywords = {
      balance: ["బ్యాలెన్స్", "శేషం", "ఖాతా"],
      savings: ["సేవింగ్‌లు", "ఉల్లసి"],
      transaction: ["వాటికి", "లెనదెన్‌లు"],
      received: ["పొందిన", "ప్రపంచి"],
      sent: ["పంపిన", "విడ్డి"],
      bills: ["బిల్‌లు", "బిల్‌లు"],
      card: ["కార్డ్", "కార్డ్ వివరాలు"],
      account: ["ఖాతా", "ఖాతా సంఖ్య"],
      send: ["పంపి", "విడ్డి"],
      help: ["సహాయ", "సహాయం"],
    }

    const tamil_keywords = {
      balance: ["இருப்பு", "இருப்பு இருப்பு", "இருப்பு"],
      savings: ["சேமிப்பு", "சேமிப்பு சேமிப்பு"],
      transaction: ["வಹಿವಾಟು", "வಹಿವಾಟುகள்"],
      received: ["பெறப்பட்டது", "பெறப்பட்ட"],
      sent: ["அனுப்பப்பட்டது", "அனுப்பப்பட்ட"],
      bills: ["பில்கள்", "பில்"],
      card: ["கார்D", "கார்D விவரங்கள்"],
      account: ["கணக்கு", "கணக்கு எண்"],
      send: ["அனுப்ப", "அனுப்பப்படுத்த"],
      help: ["தொதுக்கம்", "தொதுக்கம் தொதுக்கம்"],
    }

    const marathi_keywords = {
      balance: ["बalance", "शेष", "बैलेंस"],
      savings: ["बचत", "संपद"],
      transaction: ["वहಿವಾಟು", "वहಿವಾಟು"],
      received: ["पडळा", "पडळा"],
      sent: ["कಳುಹಿಸಿದ", "ಕಳುಹಿಸಿದ"],
      bills: ["बಿಲ್‌ಗಳು", "बಿಲ್‌"],
      card: ["ಕಾರ್ಡ್", "ಕಾರ್ಡ್"],
      account: ["खाते", "खाते"],
      send: ["ಕಳುಹಿಸಿ", "ಕಳುಹಿಸಿ"],
      help: ["ಸಹಾಯ", "सहಾय"],
    }

    const bengali_keywords = {
      balance: ["ব্যালেন্স", "সমতুল্য"],
      savings: ["সঞ্চয়", "সঞ্চয়"],
      transaction: ["লেনদেন", "লেনদেন"],
      received: ["প্রাপ্ত", "প্রাপ্ত"],
      sent: ["পাঠানো", "পাঠানো"],
      bills: ["বিল", "বিল"],
      card: ["কার্ড", "কার্ড"],
      account: ["অ্যাকাউন্ট", "অ্যাকাউন্ট"],
      send: ["পাঠানো", "পাঠানো"],
      help: ["সহায়", "সহায়"],
    }

    const gujarati_keywords = {
      balance: ["बેલેન્સ", "શેષ", "ખાતો"],
      savings: ["બચત", "સંપદ"],
      transaction: ["ટ્રાંઝેક્શન્સ", "વ્યવહાર"],
      received: ["પ્રાપ્ત", "પ્રાપ્ત"],
      sent: ["પાવતિ", "પાવતિ"],
      bills: ["બિલ્સ", "બિલ્સ"],
      card: ["કાર્ડ", "કાર્ડ"],
      account: ["એકાઉન્ટ", "એકાઉન્ટ"],
      send: ["પાવતિ", "પાવતિ"],
      help: ["સહાય", "સહાય"],
    }

    const keywordMatch = (message: string, keywords: string[]): boolean => {
      return keywords.some((keyword) => message.includes(keyword.toLowerCase()))
    }

    if (keywordMatch(lowerMessage, kannada_keywords.balance)) {
      return (
        responses.balance[language]?.[Math.floor(Math.random() * (responses.balance[language]?.length || 1))] ||
        "I can help with your balance inquiry."
      )
    } else if (keywordMatch(lowerMessage, kannada_keywords.savings)) {
      return (
        responses.savings[language]?.[Math.floor(Math.random() * (responses.savings[language]?.length || 1))] ||
        "Let me help with your savings information."
      )
    } else if (keywordMatch(lowerMessage, kannada_keywords.transaction)) {
      return (
        responses.transactions[language]?.[
          Math.floor(Math.random() * (responses.transactions[language]?.length || 1))
        ] || "Here are your transactions."
      )
    } else if (keywordMatch(lowerMessage, kannada_keywords.received)) {
      return (
        responses.received[language]?.[Math.floor(Math.random() * (responses.received[language]?.length || 1))] ||
        "I can tell you about your received transactions."
      )
    } else if (keywordMatch(lowerMessage, kannada_keywords.sent)) {
      return (
        responses.sent[language]?.[Math.floor(Math.random() * (responses.sent[language]?.length || 1))] ||
        "I can tell you about your sent transactions."
      )
    } else if (keywordMatch(lowerMessage, kannada_keywords.bills)) {
      return (
        responses.bills[language]?.[Math.floor(Math.random() * (responses.bills[language]?.length || 1))] ||
        "I can help with your bills."
      )
    } else if (keywordMatch(lowerMessage, kannada_keywords.card)) {
      return (
        responses["card details"][language]?.[
          Math.floor(Math.random() * (responses["card details"][language]?.length || 1))
        ] || "I can provide card details."
      )
    } else if (keywordMatch(lowerMessage, kannada_keywords.account)) {
      return (
        responses.account[language]?.[Math.floor(Math.random() * (responses.account[language]?.length || 1))] ||
        "I can help with your account information."
      )
    } else if (keywordMatch(lowerMessage, kannada_keywords.send)) {
      return (
        responses.send[language]?.[Math.floor(Math.random() * (responses.send[language]?.length || 1))] ||
        "I can help you send money."
      )
    } else if (keywordMatch(lowerMessage, kannada_keywords.help)) {
      return (
        responses.help[language]?.[Math.floor(Math.random() * (responses.help[language]?.length || 1))] ||
        "How can I help you?"
      )
    } else if (keywordMatch(lowerMessage, hindi_keywords.balance)) {
      return (
        responses.balance[language]?.[Math.floor(Math.random() * (responses.balance[language]?.length || 1))] ||
        "I can help with your balance inquiry."
      )
    } else if (keywordMatch(lowerMessage, hindi_keywords.savings)) {
      return (
        responses.savings[language]?.[Math.floor(Math.random() * (responses.savings[language]?.length || 1))] ||
        "Let me help with your savings information."
      )
    } else if (keywordMatch(lowerMessage, hindi_keywords.transaction)) {
      return (
        responses.transactions[language]?.[
          Math.floor(Math.random() * (responses.transactions[language]?.length || 1))
        ] || "Here are your transactions."
      )
    } else if (keywordMatch(lowerMessage, hindi_keywords.received)) {
      return (
        responses.received[language]?.[Math.floor(Math.random() * (responses.received[language]?.length || 1))] ||
        "I can tell you about your received transactions."
      )
    } else if (keywordMatch(lowerMessage, hindi_keywords.sent)) {
      return (
        responses.sent[language]?.[Math.floor(Math.random() * (responses.sent[language]?.length || 1))] ||
        "I can tell you about your sent transactions."
      )
    } else if (keywordMatch(lowerMessage, hindi_keywords.bills)) {
      return (
        responses.bills[language]?.[Math.floor(Math.random() * (responses.bills[language]?.length || 1))] ||
        "I can help with your bills."
      )
    } else if (keywordMatch(lowerMessage, hindi_keywords.card)) {
      return (
        responses["card details"][language]?.[
          Math.floor(Math.random() * (responses["card details"][language]?.length || 1))
        ] || "I can provide card details."
      )
    } else if (keywordMatch(lowerMessage, hindi_keywords.account)) {
      return (
        responses.account[language]?.[Math.floor(Math.random() * (responses.account[language]?.length || 1))] ||
        "I can help with your account information."
      )
    } else if (keywordMatch(lowerMessage, hindi_keywords.send)) {
      return (
        responses.send[language]?.[Math.floor(Math.random() * (responses.send[language]?.length || 1))] ||
        "I can help you send money."
      )
    } else if (keywordMatch(lowerMessage, hindi_keywords.help)) {
      return (
        responses.help[language]?.[Math.floor(Math.random() * (responses.help[language]?.length || 1))] ||
        "How can I help you?"
      )
    } else if (keywordMatch(lowerMessage, telugu_keywords.balance)) {
      return (
        responses.balance[language]?.[Math.floor(Math.random() * (responses.balance[language]?.length || 1))] ||
        "I can help with your balance inquiry."
      )
    } else if (keywordMatch(lowerMessage, telugu_keywords.savings)) {
      return (
        responses.savings[language]?.[Math.floor(Math.random() * (responses.savings[language]?.length || 1))] ||
        "Let me help with your savings information."
      )
    } else if (keywordMatch(lowerMessage, telugu_keywords.transaction)) {
      return (
        responses.transactions[language]?.[
          Math.floor(Math.random() * (responses.transactions[language]?.length || 1))
        ] || "Here are your transactions."
      )
    } else if (keywordMatch(lowerMessage, telugu_keywords.received)) {
      return (
        responses.received[language]?.[Math.floor(Math.random() * (responses.received[language]?.length || 1))] ||
        "I can tell you about your received transactions."
      )
    } else if (keywordMatch(lowerMessage, telugu_keywords.sent)) {
      return (
        responses.sent[language]?.[Math.floor(Math.random() * (responses.sent[language]?.length || 1))] ||
        "I can tell you about your sent transactions."
      )
    } else if (keywordMatch(lowerMessage, telugu_keywords.bills)) {
      return (
        responses.bills[language]?.[Math.floor(Math.random() * (responses.bills[language]?.length || 1))] ||
        "I can help with your bills."
      )
    } else if (keywordMatch(lowerMessage, telugu_keywords.card)) {
      return (
        responses["card details"][language]?.[
          Math.floor(Math.random() * (responses["card details"][language]?.length || 1))
        ] || "I can provide card details."
      )
    } else if (keywordMatch(lowerMessage, telugu_keywords.account)) {
      return (
        responses.account[language]?.[Math.floor(Math.random() * (responses.account[language]?.length || 1))] ||
        "I can help with your account information."
      )
    } else if (keywordMatch(lowerMessage, telugu_keywords.send)) {
      return (
        responses.send[language]?.[Math.floor(Math.random() * (responses.send[language]?.length || 1))] ||
        "I can help you send money."
      )
    } else if (keywordMatch(lowerMessage, telugu_keywords.help)) {
      return (
        responses.help[language]?.[Math.floor(Math.random() * (responses.help[language]?.length || 1))] ||
        "How can I help you?"
      )
    } else if (keywordMatch(lowerMessage, tamil_keywords.balance)) {
      return (
        responses.balance[language]?.[Math.floor(Math.random() * (responses.balance[language]?.length || 1))] ||
        "I can help with your balance inquiry."
      )
    } else if (keywordMatch(lowerMessage, tamil_keywords.savings)) {
      return (
        responses.savings[language]?.[Math.floor(Math.random() * (responses.savings[language]?.length || 1))] ||
        "Let me help with your savings information."
      )
    } else if (keywordMatch(lowerMessage, tamil_keywords.transaction)) {
      return (
        responses.transactions[language]?.[
          Math.floor(Math.random() * (responses.transactions[language]?.length || 1))
        ] || "Here are your transactions."
      )
    } else if (keywordMatch(lowerMessage, tamil_keywords.received)) {
      return (
        responses.received[language]?.[Math.floor(Math.random() * (responses.received[language]?.length || 1))] ||
        "I can tell you about your received transactions."
      )
    } else if (keywordMatch(lowerMessage, tamil_keywords.sent)) {
      return (
        responses.sent[language]?.[Math.floor(Math.random() * (responses.sent[language]?.length || 1))] ||
        "I can tell you about your sent transactions."
      )
    } else if (keywordMatch(lowerMessage, tamil_keywords.bills)) {
      return (
        responses.bills[language]?.[Math.floor(Math.random() * (responses.bills[language]?.length || 1))] ||
        "I can help with your bills."
      )
    } else if (keywordMatch(lowerMessage, tamil_keywords.card)) {
      return (
        responses["card details"][language]?.[
          Math.floor(Math.random() * (responses["card details"][language]?.length || 1))
        ] || "I can provide card details."
      )
    } else if (keywordMatch(lowerMessage, tamil_keywords.account)) {
      return (
        responses.account[language]?.[Math.floor(Math.random() * (responses.account[language]?.length || 1))] ||
        "I can help with your account information."
      )
    } else if (keywordMatch(lowerMessage, tamil_keywords.send)) {
      return (
        responses.send[language]?.[Math.floor(Math.random() * (responses.send[language]?.length || 1))] ||
        "I can help you send money."
      )
    } else if (keywordMatch(lowerMessage, tamil_keywords.help)) {
      return (
        responses.help[language]?.[Math.floor(Math.random() * (responses.help[language]?.length || 1))] ||
        "How can I help you?"
      )
    } else if (keywordMatch(lowerMessage, marathi_keywords.balance)) {
      return (
        responses.balance[language]?.[Math.floor(Math.random() * (responses.balance[language]?.length || 1))] ||
        "I can help with your balance inquiry."
      )
    } else if (keywordMatch(lowerMessage, marathi_keywords.savings)) {
      return (
        responses.savings[language]?.[Math.floor(Math.random() * (responses.savings[language]?.length || 1))] ||
        "Let me help with your savings information."
      )
    } else if (keywordMatch(lowerMessage, marathi_keywords.transaction)) {
      return (
        responses.transactions[language]?.[
          Math.floor(Math.random() * (responses.transactions[language]?.length || 1))
        ] || "Here are your transactions."
      )
    } else if (keywordMatch(lowerMessage, marathi_keywords.received)) {
      return (
        responses.received[language]?.[Math.floor(Math.random() * (responses.received[language]?.length || 1))] ||
        "I can tell you about your received transactions."
      )
    } else if (keywordMatch(lowerMessage, marathi_keywords.sent)) {
      return (
        responses.sent[language]?.[Math.floor(Math.random() * (responses.sent[language]?.length || 1))] ||
        "I can tell you about your sent transactions."
      )
    } else if (keywordMatch(lowerMessage, marathi_keywords.bills)) {
      return (
        responses.bills[language]?.[Math.floor(Math.random() * (responses.bills[language]?.length || 1))] ||
        "I can help with your bills."
      )
    } else if (keywordMatch(lowerMessage, marathi_keywords.card)) {
      return (
        responses["card details"][language]?.[
          Math.floor(Math.random() * (responses["card details"][language]?.length || 1))
        ] || "I can provide card details."
      )
    } else if (keywordMatch(lowerMessage, marathi_keywords.account)) {
      return (
        responses.account[language]?.[Math.floor(Math.random() * (responses.account[language]?.length || 1))] ||
        "I can help with your account information."
      )
    } else if (keywordMatch(lowerMessage, marathi_keywords.send)) {
      return (
        responses.send[language]?.[Math.floor(Math.random() * (responses.send[language]?.length || 1))] ||
        "I can help you send money."
      )
    } else if (keywordMatch(lowerMessage, marathi_keywords.help)) {
      return (
        responses.help[language]?.[Math.floor(Math.random() * (responses.help[language]?.length || 1))] ||
        "How can I help you?"
      )
    } else if (keywordMatch(lowerMessage, bengali_keywords.balance)) {
      return (
        responses.balance[language]?.[Math.floor(Math.random() * (responses.balance[language]?.length || 1))] ||
        "I can help with your balance inquiry."
      )
    } else if (keywordMatch(lowerMessage, bengali_keywords.savings)) {
      return (
        responses.savings[language]?.[Math.floor(Math.random() * (responses.savings[language]?.length || 1))] ||
        "Let me help with your savings information."
      )
    } else if (keywordMatch(lowerMessage, bengali_keywords.transaction)) {
      return (
        responses.transactions[language]?.[
          Math.floor(Math.random() * (responses.transactions[language]?.length || 1))
        ] || "Here are your transactions."
      )
    } else if (keywordMatch(lowerMessage, bengali_keywords.received)) {
      return (
        responses.received[language]?.[Math.floor(Math.random() * (responses.received[language]?.length || 1))] ||
        "I can tell you about your received transactions."
      )
    } else if (keywordMatch(lowerMessage, bengali_keywords.sent)) {
      return (
        responses.sent[language]?.[Math.floor(Math.random() * (responses.sent[language]?.length || 1))] ||
        "I can tell you about your sent transactions."
      )
    } else if (keywordMatch(lowerMessage, bengali_keywords.bills)) {
      return (
        responses.bills[language]?.[Math.floor(Math.random() * (responses.bills[language]?.length || 1))] ||
        "I can help with your bills."
      )
    } else if (keywordMatch(lowerMessage, bengali_keywords.card)) {
      return (
        responses["card details"][language]?.[
          Math.floor(Math.random() * (responses["card details"][language]?.length || 1))
        ] || "I can provide card details."
      )
    } else if (keywordMatch(lowerMessage, bengali_keywords.account)) {
      return (
        responses.account[language]?.[Math.floor(Math.random() * (responses.account[language]?.length || 1))] ||
        "I can help with your account information."
      )
    } else if (keywordMatch(lowerMessage, bengali_keywords.send)) {
      return (
        responses.send[language]?.[Math.floor(Math.random() * (responses.send[language]?.length || 1))] ||
        "I can help you send money."
      )
    } else if (keywordMatch(lowerMessage, bengali_keywords.help)) {
      return (
        responses.help[language]?.[Math.floor(Math.random() * (responses.help[language]?.length || 1))] ||
        "How can I help you?"
      )
    } else if (keywordMatch(lowerMessage, gujarati_keywords.balance)) {
      return (
        responses.balance[language]?.[Math.floor(Math.random() * (responses.balance[language]?.length || 1))] ||
        "I can help with your balance inquiry."
      )
    } else if (keywordMatch(lowerMessage, gujarati_keywords.savings)) {
      return (
        responses.savings[language]?.[Math.floor(Math.random() * (responses.savings[language]?.length || 1))] ||
        "Let me help with your savings information."
      )
    } else if (keywordMatch(lowerMessage, gujarati_keywords.transaction)) {
      return (
        responses.transactions[language]?.[
          Math.floor(Math.random() * (responses.transactions[language]?.length || 1))
        ] || "Here are your transactions."
      )
    } else if (keywordMatch(lowerMessage, gujarati_keywords.received)) {
      return (
        responses.received[language]?.[Math.floor(Math.random() * (responses.received[language]?.length || 1))] ||
        "I can tell you about your received transactions."
      )
    } else if (keywordMatch(lowerMessage, gujarati_keywords.sent)) {
      return (
        responses.sent[language]?.[Math.floor(Math.random() * (responses.sent[language]?.length || 1))] ||
        "I can tell you about your sent transactions."
      )
    } else if (keywordMatch(lowerMessage, gujarati_keywords.bills)) {
      return (
        responses.bills[language]?.[Math.floor(Math.random() * (responses.bills[language]?.length || 1))] ||
        "I can help with your bills."
      )
    } else if (keywordMatch(lowerMessage, gujarati_keywords.card)) {
      return (
        responses["card details"][language]?.[
          Math.floor(Math.random() * (responses["card details"][language]?.length || 1))
        ] || "I can provide card details."
      )
    } else if (keywordMatch(lowerMessage, gujarati_keywords.account)) {
      return (
        responses.account[language]?.[Math.floor(Math.random() * (responses.account[language]?.length || 1))] ||
        "I can help with your account information."
      )
    } else if (keywordMatch(lowerMessage, gujarati_keywords.send)) {
      return (
        responses.send[language]?.[Math.floor(Math.random() * (responses.send[language]?.length || 1))] ||
        "I can help you send money."
      )
    } else if (keywordMatch(lowerMessage, gujarati_keywords.help)) {
      return (
        responses.help[language]?.[Math.floor(Math.random() * (responses.help[language]?.length || 1))] ||
        "How can I help you?"
      )
    } else {
      return "I'm sorry, I didn't understand that. Can you please rephrase?"
    }
  }

  const handleSend = () => {
    if (input.trim() === "") return

    console.log("[v0] handleSend called with balance:", balance, "current context balance:", balance)

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }
    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setIsLoading(true)

    const botResponseContent = generateResponse(input, selectedLanguage, balance, savings, transactions, bills)

    console.log("[v0] Bot response generated with balance:", balance)

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botResponseContent,
      },
    ])
    setIsLoading(false)
    setInput("")
  }

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value)
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 z-50">
      {!isOpen && (
        <Button variant="outline" size="icon" className="rounded-full bg-transparent" onClick={() => setIsOpen(true)}>
          <MessageCircle className="h-5 md:h-6 w-5 md:w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[calc(100vh-6rem)] md:h-screen flex flex-col overflow-hidden">
          <div className="p-2.5 md:p-4 bg-primary text-white flex justify-between items-center gap-2">
            <h2 className="text-base md:text-lg font-semibold">Bank Assistant</h2>
            <div className="flex items-center gap-1.5 md:gap-2">
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="text-black p-1 md:p-2 rounded-md text-xs md:text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="md:size-auto">
                <X className="h-4 md:h-5 w-4 md:w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 md:p-4 space-y-2.5 md:space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg p-2 md:p-3 break-words text-sm md:text-base max-w-[80%] md:max-w-xs ${
                    message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="animate-pulse rounded-lg p-2 md:p-3 bg-gray-200 text-black text-sm md:text-base">
                  ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 md:p-4 border-t flex items-center gap-1 md:gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type..."
              className="flex-1 text-sm md:text-base h-8 md:h-10"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSend()
                }
              }}
            />
            <Button size="sm" onClick={handleSend} disabled={isLoading} className="md:size-auto p-1.5 md:p-2">
              <Send className="h-4 md:h-5 w-4 md:w-5" />
            </Button>
            <Button
              size="sm"
              variant={isListening ? "default" : "outline"}
              onClick={handleMicClick}
              disabled={isLoading}
              className="md:size-auto p-1.5 md:p-2"
            >
              <Mic className="h-4 md:h-5 w-4 md:w-5" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
