"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  bio?: string
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Placeholder: will connect to database
      const mockUser: User = {
        id: "1",
        email,
        username: email.split("@")[0],
        createdAt: new Date(),
      }
      setUser(mockUser)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(async (email: string, username: string, password: string) => {
    setIsLoading(true)
    try {
      // Placeholder: will connect to database
      const newUser: User = {
        id: Date.now().toString(),
        email,
        username,
        createdAt: new Date(),
      }
      setUser(newUser)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null))
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
