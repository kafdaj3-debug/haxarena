import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X } from "lucide-react";
import { buildApiUrl } from "@/lib/queryClient";

export default function ProfileSettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingPicture, setIsLoadingPicture] = useState(false);
  const [previewPicture, setPreviewPicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingUsername(true);
    try {
      const response = await fetch(buildApiUrl("/api/profile/username"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Güncelleme Başarısız",
          description: error.error || "Kullanıcı adı güncellenemedi",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Başarılı",
        description: "Kullanıcı adınız güncellendi",
      });
      setUsername("");
      window.location.reload();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsername(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingPassword(true);
    try {
      const response = await fetch(buildApiUrl("/api/profile/password"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Güncelleme Başarısız",
          description: error.error || "Şifre güncellenemedi",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Başarılı",
        description: "Şifreniz güncellendi",
      });
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Dosya Çok Büyük",
        description: "Maksimum dosya boyutu 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Geçersiz Dosya",
        description: "Lütfen bir resim dosyası seçin",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPicture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePictureUpload = async () => {
    if (!previewPicture) return;

    setIsLoadingPicture(true);
    try {
      const response = await fetch(buildApiUrl("/api/profile/picture"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profilePicture: previewPicture }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Yükleme Başarısız",
          description: error.error || "Profil fotoğrafı yüklenemedi",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Başarılı",
        description: "Profil fotoğrafınız güncellendi",
      });
      setPreviewPicture(null);
      window.location.reload();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPicture(false);
    }
  };

  const handleRemovePicture = async () => {
    setIsLoadingPicture(true);
    try {
      const response = await fetch(buildApiUrl("/api/profile/picture"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profilePicture: null }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Silme Başarısız",
          description: error.error || "Profil fotoğrafı silinemedi",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Başarılı",
        description: "Profil fotoğrafınız silindi",
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPicture(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={user} onLogout={logout} />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 text-center">
            <p>Giriş yapmalısınız</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Profil Ayarları</h1>
            <p className="text-muted-foreground">Hesap bilgilerinizi güncelleyin</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profil Fotoğrafı</CardTitle>
                <CardDescription>Profil fotoğrafınızı değiştirin (GIF desteklenir, maks. 5MB)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={previewPicture || user.profilePicture || undefined} alt={user.username} />
                    <AvatarFallback className="text-3xl">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePictureChange}
                    className="hidden"
                    data-testid="input-profile-picture"
                  />
                  
                  <div className="flex gap-2">
                    {!previewPicture ? (
                      <>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          disabled={isLoadingPicture}
                          data-testid="button-select-picture"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Fotoğraf Seç
                        </Button>
                        {user.profilePicture && (
                          <Button
                            onClick={handleRemovePicture}
                            variant="destructive"
                            disabled={isLoadingPicture}
                            data-testid="button-remove-picture"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Fotoğrafı Kaldır
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handlePictureUpload}
                          disabled={isLoadingPicture}
                          data-testid="button-upload-picture"
                        >
                          {isLoadingPicture ? "Yükleniyor..." : "Kaydet"}
                        </Button>
                        <Button
                          onClick={() => setPreviewPicture(null)}
                          variant="outline"
                          disabled={isLoadingPicture}
                          data-testid="button-cancel-picture"
                        >
                          İptal
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hesap Bilgileri</CardTitle>
                <CardDescription>Mevcut hesap durumunuz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Kullanıcı Adı</Label>
                  <p className="text-lg font-medium">{user.username}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Rol</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                </div>
                {user.isAdmin && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Yetkiler</Label>
                    <div className="mt-1 flex gap-2">
                      <Badge>Admin</Badge>
                      {user.isSuperAdmin && <Badge variant="destructive">Yönetim</Badge>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Adını Değiştir</CardTitle>
                <CardDescription>Yeni kullanıcı adınızı girin</CardDescription>
              </CardHeader>
              <form onSubmit={handleUsernameUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Yeni Kullanıcı Adı</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Yeni kullanıcı adı"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      data-testid="input-new-username"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={isLoadingUsername}
                    data-testid="button-update-username"
                  >
                    {isLoadingUsername ? "Güncelleniyor..." : "Kullanıcı Adını Güncelle"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>Yeni şifrenizi belirleyin</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mevcut Şifre</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Mevcut şifreniz"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      data-testid="input-current-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Yeni Şifre</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Yeni şifreniz"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      data-testid="input-new-password"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={isLoadingPassword}
                    data-testid="button-update-password"
                  >
                    {isLoadingPassword ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
