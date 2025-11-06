import type { UIMessage } from "ai"

// Mock banking responses for demo mode - no API calls needed
const mockBankingResponses = [
  {
    keywords: ["balance", "account balance", "how much"],
    responses: [
      "Your current balance is ₹45,230! Everything looking good.",
      "Let me check... your account balance is ₹1,23,456.",
      "You have ₹87,900 in your account right now.",
      "Your balance shows ₹56,780. Nice savings!",
      "Current balance: ₹2,10,450",
    ],
  },
  {
    keywords: ["card", "credit card", "debit card", "card number", "cvv"],
    responses: [
      "Demo card: 4532-8765-4321-9876, CVV: 234, Expires: 12/26",
      "Your demo card: 5412-1234-5678-2109, Security code: 567, Valid till 08/25",
      "Card details - Demo: 3782-9876-5432-1098, CVV: 892",
      "Here's a demo card number: 6011-4532-1234-5678, CVV: 445",
      "Demo card number: 4916-7823-4561-2890, Security: 673",
    ],
  },
  {
    keywords: ["pin", "password", "security pin", "access code"],
    responses: [
      "Your demo PIN for this session: 7834",
      "Security PIN: 5421",
      "Demo access code: 2918",
      "Your PIN: 6543",
      "Current PIN: 4029",
    ],
  },
  {
    keywords: ["account number", "account no", "ifsc"],
    responses: [
      "Demo account: 9876543210, IFSC: MYBANK0456",
      "Account number: 1122334455, IFSC: MYBANK1234",
      "Your account: 5544332211, Bank code: MYBANK5678",
      "Demo account: 7788990011, IFSC: MYBANK9999",
      "Account: 2233445566, IFSC: MYBANK0123",
    ],
  },
  {
    keywords: ["transaction", "transfer", "payment", "sent", "received"],
    responses: [
      "Your last transaction was a payment of ₹5,000 to Electricity Bill on Nov 2nd.",
      "Recent: You received ₹15,000 from your employer on Nov 1st.",
      "Last payment: ₹3,200 to Mobile Bill was successful.",
      "You sent ₹10,000 to a friend yesterday.",
      "Recent transaction: Received ₹8,500 from freelance work.",
    ],
  },
  {
    keywords: ["bill", "payment", "due", "reminder"],
    responses: [
      "Your electricity bill of ₹2,450 is due on Nov 15th.",
      "Water bill reminder: ₹1,200 due next week.",
      "You have 3 upcoming bills. Internet bill (₹899) is due in 3 days.",
      "Mobile bill of ₹599 will be due on Nov 12th.",
      "Your credit card bill of ₹8,500 is due on Nov 20th.",
    ],
  },
  {
    keywords: ["help", "support", "assist", "how can you"],
    responses: [
      "I can help you check your balance, view transactions, manage bills, send money, and answer banking questions!",
      "I'm here to assist with account info, transaction history, bill payments, and general banking queries.",
      "Need help? I can tell you about your balance, recent payments, upcoming bills, and more!",
      "I can help with checking balance, sending money, bill payments, and banking questions.",
      "Ask me about your account, transactions, bills, transfers, or any banking question!",
    ],
  },
  {
    keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon"],
    responses: [
      "Hey there! Welcome to MyBank. How can I assist you today?",
      "Hello! I'm your banking assistant. What can I help with?",
      "Hi! Ready to help with your banking needs. What's up?",
      "Greetings! How can I make your banking day easier?",
      "Hey! What banking question can I answer for you?",
    ],
  },
]

// Default responses for unmatched queries
const defaultResponses = [
  "That's a great question! In banking, it's important to keep your accounts secure and monitor your transactions regularly.",
  "Banking is all about managing your money wisely. Would you like to know more about any specific banking feature?",
  "I'm here to help! Try asking me about your balance, transactions, bills, or sending money.",
  "Fun banking fact: The first ATM was installed in London in 1967! What else can I help you with?",
  "Smart banking tip: Always set reminders for bill payments to avoid late fees!",
  "Did you know? Digital banking has made transfers almost instant nowadays. What can I help you with?",
  "Great question! Banking continues to evolve. Would you like help with something specific?",
  "I love helping with banking queries! Ask me anything about your account or transactions.",
]

function generateDemoResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()

  // Find matching response category
  for (const category of mockBankingResponses) {
    if (category.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      const responses = category.responses
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  // Return random default response
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const lastMessage = messages[messages.length - 1]
    const userQuery = lastMessage.content

    const response = generateDemoResponse(userQuery)

    // Create proper text event stream format
    const streamContent = `data: ${JSON.stringify({
      type: "text",
      text: response,
    })}\n\n`

    return new Response(streamContent, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[v0] Chat error:", error)
    return new Response(
      `data: ${JSON.stringify({
        type: "text",
        text: "Sorry, I encountered an error. Please try again.",
      })}\n\n`,
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      },
    )
  }
}
