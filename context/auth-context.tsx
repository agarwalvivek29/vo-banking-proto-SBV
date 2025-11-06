"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface User {
  id: string
  accountNumber: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (accountNumber: string, pin: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (accountNumber: string, pin: string) => {
    setIsLoading(true)
    try {
      // Simulate API call with validation
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (accountNumber && pin && pin.length === 4 && /^\d+$/.test(pin)) {
        const newUser: User = {
          id: `user-${accountNumber}`,
          accountNumber,
          name: "John Doe",
        }
        setUser(newUser)
      } else {
        throw new Error("Invalid account number or PIN")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
