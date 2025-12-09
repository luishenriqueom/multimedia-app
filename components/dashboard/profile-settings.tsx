"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useMedia } from "@/contexts/media-context"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function ProfileSettings() {
  const { user, updateProfile } = useAuth()
  const { mediaItems } = useMedia()
  const [username, setUsername] = useState(user?.username || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const MAX_BIO_LENGTH = 300

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // client-side validation
      if (bio && bio.length > MAX_BIO_LENGTH) {
        toast({ title: "Bio muito longa", description: `Máximo ${MAX_BIO_LENGTH} caracteres.`, variant: "destructive" })
        setIsSaving(false)
        return
      }

      // persist changes to backend
      try {
        const updated = await apiFetch("/users/me", {
          method: "PUT",
          body: JSON.stringify({ full_name: username, bio }),
        })

        // update local auth state with normalized fields
        updateProfile({ username: updated.full_name || updated.email.split("@")[0], bio: updated.bio ?? null })

        toast({ title: "Perfil atualizado", description: "Alterações salvas com sucesso." })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        toast({ title: "Erro ao salvar", description: msg || "Não foi possível salvar as alterações.", variant: "destructive" })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const totalFileSize = mediaItems.reduce((acc, item) => acc + item.fileSize, 0)

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Gerencie as informações da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {user?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-lg">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <div>
              <label className="text-sm font-medium">Nome de usuário</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você"
                className="mt-2"
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
          <CardDescription>Informações sobre sua galeria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total de Arquivos</p>
              <p className="text-3xl font-bold">{mediaItems.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Imagens</p>
              <p className="text-3xl font-bold">{mediaItems.filter((m) => m.type === "image").length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Áudios</p>
              <p className="text-3xl font-bold">{mediaItems.filter((m) => m.type === "audio").length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Vídeos</p>
              <p className="text-3xl font-bold">{mediaItems.filter((m) => m.type === "video").length}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Espaço Total Usado</p>
            <p className="text-2xl font-bold">{(totalFileSize / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
