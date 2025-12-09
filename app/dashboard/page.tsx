"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/layout"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  // useEffect(() => {
  //   // Protect route - redirect to login if not authenticated
  //   if (user === null) {
  //     router.push("/")
  //   }
  // }, [user, router])

  // if (!user) {
  //   return null
  // }

  return <DashboardLayout />
}
