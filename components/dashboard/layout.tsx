"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sidebar } from "./sidebar"
import { MediaGallery } from "./media-gallery"
import { UploadMedia } from "./upload-media"
import { ProfileSettings } from "./profile-settings"
import { Menu, LogOut, Settings } from "lucide-react"

type View = "gallery" | "upload" | "profile"

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState<View>("gallery")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      // ensure navigation back to the login/landing page
      router.replace("/")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                MM
              </div>
              <h1 className="text-2xl font-bold text-foreground">Multimídia Manager</h1>
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                {user?.username}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCurrentView("profile")} className="gap-2">
                <Settings className="h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="hidden lg:block w-56 border-r border-border bg-card/50">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === "gallery" && <MediaGallery />}
            {currentView === "upload" && <UploadMedia />}
            {currentView === "profile" && <ProfileSettings />}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/50" onClick={() => setIsSidebarOpen(false)}>
          <aside className="absolute left-0 top-0 h-full w-56 bg-card border-r border-border">
            <div className="mt-4">
              <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
