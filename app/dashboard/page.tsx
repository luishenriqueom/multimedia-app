"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/layout"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Protege a rota: se já terminou o carregamento e não há usuário, redireciona
    if (!isLoading && user === null) {
      router.replace("/")
    }
  }, [isLoading, user, router])

  // enquanto carrega ou se já redirecionou, não renderiza o conteúdo
  if (isLoading || user === null) {
    return null
  }

  return <DashboardLayout />
}
