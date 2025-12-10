"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useMedia } from "@/contexts/media-context"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/hooks/use-media"

export function ProfileSettings() {
  const { user, updateProfile } = useAuth()
  const { mediaItems } = useMedia()
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [username, setUsername] = useState(user?.username || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [isSaving, setIsSaving] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" })
  const { toast } = useToast()
  const MAX_BIO_LENGTH = 300

  // keep local form state in sync when user loads/changes
  useEffect(() => {
    setFullName(user?.fullName || "")
    setUsername(user?.username || "")
    setBio(user?.bio || "")
  }, [user])

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
          body: JSON.stringify({ full_name: fullName, username: username || null, bio }),
        })

        // update local auth state with normalized fields
        updateProfile({
          fullName: updated.full_name ?? undefined,
          username: updated.username ?? undefined,
          bio: updated.bio ?? null,
        })

        toast({ title: "Perfil atualizado", description: "Alterações salvas com sucesso." })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        toast({ title: "Erro ao salvar", description: msg || "Não foi possível salvar as alterações.", variant: "destructive" })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      // Upload as profile image
      await uploadImage(file, { is_profile: true })
      // Refresh user from API
      const me = await apiFetch("/users/me", { method: "GET" })
      updateProfile({ fullName: me.full_name ?? undefined, bio: me.bio ?? null, avatar: me.avatar_url ?? undefined })
      toast({ title: "Avatar atualizado", description: "Sua foto de perfil foi atualizada." })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast({ title: "Erro ao enviar avatar", description: msg || "Não foi possível enviar a imagem.", variant: "destructive" })
    }
  }

  // --- New avatar UI: preview + confirm flow ---
  function AvatarSection() {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
      if (!selectedFile) {
        setPreviewUrl(null)
        return
      }
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }, [selectedFile])

    const openFilePicker = () => inputRef.current?.click()

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) setSelectedFile(f)
    }

    const confirmUpload = async () => {
      if (!selectedFile) return
      setIsUploading(true)
      try {
        await uploadImage(selectedFile, { is_profile: true })
        const me = await apiFetch("/users/me", { method: "GET" })
        updateProfile({ fullName: me.full_name ?? undefined, bio: me.bio ?? null, avatar: me.avatar_url ?? undefined })
        setSelectedFile(null)
        toast({ title: "Avatar atualizado", description: "Sua foto de perfil foi atualizada." })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        toast({ title: "Erro ao enviar avatar", description: msg || "Não foi possível enviar a imagem.", variant: "destructive" })
      } finally {
        setIsUploading(false)
      }
    }

    const cancelPreview = () => setSelectedFile(null)

    return (
      <div className="flex items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-20 w-20">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt={user?.username || "preview"} />
              ) : user?.avatar ? (
                <AvatarImage src={user.avatar} alt={user?.username || "avatar"} />
              ) : (
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="mt-2 flex gap-2">
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              <Button size="sm" onClick={openFilePicker} disabled={isUploading}>
                Alterar foto
              </Button>
              {selectedFile && (
                <>
                  <Button size="sm" variant="ghost" onClick={cancelPreview} disabled={isUploading}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={confirmUpload} disabled={isUploading}>
                    {isUploading ? "Enviando..." : "Confirmar"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
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
            <AvatarSection />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-lg">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <div>
              <label className="text-sm font-medium">Nome completo</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2" />
            </div>
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
            <div className="mt-4 border-t border-border pt-4">
              <label className="text-sm font-medium">Alterar senha</label>
              <div className="mt-2 space-y-2 max-w-md">
                <Input
                  type="password"
                  placeholder="Senha atual"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      // reset inline status
                      setPasswordStatus({ type: "idle" })
                      if (!oldPassword || !newPassword) {
                        const msg = 'Preencha a senha atual e a nova senha.'
                        toast({ title: 'Campos vazios', description: msg, variant: 'destructive' })
                        setPasswordStatus({ type: 'error', message: msg })
                        return
                      }
                      if (newPassword !== confirmPassword) {
                        const msg = 'A nova senha e a confirmação não são iguais.'
                        toast({ title: 'Senhas não batem', description: msg, variant: 'destructive' })
                        setPasswordStatus({ type: 'error', message: msg })
                        return
                      }
                      setIsChangingPassword(true)
                      try {
                        await apiFetch('/users/me/password', {
                          method: 'PUT',
                          body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
                        })
                        setOldPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                        const successMsg = 'Sua senha foi alterada com sucesso.'
                        toast({ title: 'Senha atualizada', description: successMsg })
                        setPasswordStatus({ type: 'success', message: successMsg })
                        // clear message after 6s
                        setTimeout(() => setPasswordStatus({ type: 'idle' }), 6000)
                      } catch (err) {
                        const msg = err instanceof Error ? err.message : String(err)
                        const display = msg || 'Não foi possível alterar a senha.'
                        toast({ title: 'Erro', description: display, variant: 'destructive' })
                        setPasswordStatus({ type: 'error', message: display })
                      } finally {
                        setIsChangingPassword(false)
                      }
                    }}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? 'Alterando...' : 'Alterar senha'}
                  </Button>
                </div>
                {passwordStatus.type !== 'idle' && (
                  <p className={`${passwordStatus.type === 'success' ? 'text-green-600' : 'text-destructive'} mt-2`}>
                    {passwordStatus.message}
                  </p>
                )}
              </div>
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
