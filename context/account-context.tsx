"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Bill {
  id: number
  name: string
  amount: number
  dueDate: string
  status: "pending" | "paid"
}

interface Transaction {
  id: number
  name: string
  amount: number
  type: "sent" | "received"
  date: string
  time: string
}

interface MoneyRequest {
  id: number
  recipientName: string
  amount: number
  status: "pending" | "accepted" | "declined"
  date: string
  time: string
}

interface AccountContextType {
  balance: number
  savings: number
  bills: Bill[]
  transactions: Transaction[]
  moneyRequests: MoneyRequest[]
  updateBalance: (amount: number) => void
  payBill: (billId: number) => void
  sendMoney: (recipientName: string, amount: number) => void
  receiveMoney: (senderName: string, amount: number) => void
  addToSavings: (amount: number) => void
  requestMoney: (recipientName: string, amount: number) => void
  cancelRequest: (requestId: number) => void
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

const DEFAULT_BILLS: Bill[] = [
  { id: 1, name: "Electricity", amount: 1500, dueDate: "5th Nov", status: "pending" },
  { id: 2, name: "Internet", amount: 800, dueDate: "10th Nov", status: "pending" },
  { id: 3, name: "Water", amount: 400, dueDate: "15th Nov", status: "paid" },
  { id: 4, name: "Mobile", amount: 599, dueDate: "20th Nov", status: "pending" },
]

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 1, name: "Grocery Store", amount: 450, type: "sent", date: "Today", time: "2:30 PM" },
  { id: 2, name: "Salary Credit", amount: 25000, type: "received", date: "Yesterday", time: "10:00 AM" },
  { id: 3, name: "Electricity Bill", amount: 1200, type: "sent", date: "2 days ago", time: "3:15 PM" },
  { id: 4, name: "Freelance Payment", amount: 5000, type: "received", date: "3 days ago", time: "11:45 AM" },
  { id: 5, name: "Restaurant", amount: 850, type: "sent", date: "4 days ago", time: "8:20 PM" },
]

const DEFAULT_REQUESTS: MoneyRequest[] = [
  { id: 1, recipientName: "Advait", amount: 500, status: "pending", date: "Today", time: "1:15 PM" },
  { id: 2, recipientName: "Rohit", amount: 1000, status: "accepted", date: "Yesterday", time: "4:30 PM" },
  { id: 3, recipientName: "Priya", amount: 250, status: "declined", date: "2 days ago", time: "11:20 AM" },
]

const RANDOM_NAMES = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Arjun",
  "Rohan",
  "Nikhil",
  "Priya",
  "Ananya",
  "Diya",
  "Sakshi",
  "Rahul",
  "Karan",
  "Sneha",
  "Pooja",
  "Neha",
  "Akshay",
  "Varun",
  "Ravi",
  "Sanjana",
  "Anjali",
]

const getRandomName = () => {
  return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(45000)
  const [savings, setSavings] = useState(12000)
  const [bills, setBills] = useState<Bill[]>(DEFAULT_BILLS)
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS)
  const [moneyRequests, setMoneyRequests] = useState<MoneyRequest[]>(DEFAULT_REQUESTS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedBalance = localStorage.getItem("accountBalance")
    const savedSavings = localStorage.getItem("accountSavings")
    const savedTransactions = localStorage.getItem("accountTransactions")
    const savedMoneyRequests = localStorage.getItem("accountMoneyRequests")

    if (savedBalance) setBalance(JSON.parse(savedBalance))
    if (savedSavings) setSavings(JSON.parse(savedSavings))
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
    if (savedMoneyRequests) setMoneyRequests(JSON.parse(savedMoneyRequests))

    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("accountBalance", JSON.stringify(balance))
    }
  }, [balance, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("accountSavings", JSON.stringify(savings))
    }
  }, [savings, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("accountTransactions", JSON.stringify(transactions))
    }
  }, [transactions, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("accountMoneyRequests", JSON.stringify(moneyRequests))
    }
  }, [moneyRequests, isLoaded])

  const updateBalance = (amount: number) => {
    setBalance((prev) => Math.max(0, prev + amount))
  }

  const payBill = (billId: number) => {
    const bill = bills.find((b) => b.id === billId)
    if (bill && balance >= bill.amount) {
      updateBalance(-bill.amount)
      setBills((prevBills) => prevBills.map((b) => (b.id === billId ? { ...b, status: "paid" } : b)))

      const now = new Date()
      const newTransaction: Transaction = {
        id: Math.max(...transactions.map((t) => t.id), 0) + 1,
        name: bill.name,
        amount: bill.amount,
        type: "sent",
        date: "Today",
        time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }
      setTransactions((prev) => [newTransaction, ...prev])
    }
  }

  const sendMoney = (recipientName: string, amount: number) => {
    if (balance >= amount) {
      updateBalance(-amount)
      const now = new Date()
      const newTransaction: Transaction = {
        id: Math.max(...transactions.map((t) => t.id), 0) + 1,
        name: recipientName,
        amount,
        type: "sent",
        date: "Today",
        time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }
      setTransactions((prev) => [newTransaction, ...prev])
    }
  }

  const receiveMoney = (senderName: string, amount: number) => {
    updateBalance(amount)
    const now = new Date()
    const newTransaction: Transaction = {
      id: Math.max(...transactions.map((t) => t.id), 0) + 1,
      name: senderName,
      amount,
      type: "received",
      date: "Today",
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const addToSavings = (amount: number) => {
    if (balance >= amount && amount > 0) {
      updateBalance(-amount)
      setSavings((prev) => prev + amount)
    }
  }

  const requestMoney = (recipientName: string, amount: number) => {
    const now = new Date()
    const finalRecipientName = recipientName.trim() ? recipientName : getRandomName()
    const newRequest: MoneyRequest = {
      id: Math.max(...moneyRequests.map((r) => r.id), 0) + 1,
      recipientName: finalRecipientName,
      amount,
      status: "pending",
      date: "Today",
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }
    setMoneyRequests((prev) => [newRequest, ...prev])
  }

  const cancelRequest = (requestId: number) => {
    setMoneyRequests((prev) => prev.filter((req) => req.id !== requestId))
  }

  return (
    <AccountContext.Provider
      value={{
        balance,
        savings,
        bills,
        transactions,
        moneyRequests,
        updateBalance,
        payBill,
        sendMoney,
        receiveMoney,
        addToSavings,
        requestMoney,
        cancelRequest,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error("useAccount must be used within AccountProvider")
  }
  return context
}
