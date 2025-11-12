import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl } from "@/lib/queryClient";

export default function PasswordResetPage() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Hata",
        description: "Şifreler eşleşmiyor",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalı",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(buildApiUrl("/api/password-reset/verify"), {
        method: "POST",
        body: JSON.stringify({ username, token, newPassword }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.error || "Şifre sıfırlanamadı",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Başarılı",
        description: "Şifreniz değiştirildi. Giriş yapabilirsiniz.",
      });
      
      setTimeout(() => {
        window.location.href = "/giris";
      }, 1500);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu, lütfen tekrar deneyin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8">
          <div className="text-3xl font-heading font-bold text-primary">
            HaxArena V6
          </div>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Şifre Sıfırlama</CardTitle>
            <CardDescription>
              Yöneticiden aldığınız kodu kullanarak şifrenizi sıfırlayın
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-username">Kullanıcı Adı</Label>
                <Input
                  id="reset-username"
                  type="text"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  data-testid="input-reset-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-token">Sıfırlama Kodu</Label>
                <Input
                  id="reset-token"
                  type="text"
                  placeholder="6 haneli kodu girin"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  maxLength={6}
                  data-testid="input-reset-token"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-new-password">Yeni Şifre</Label>
                <Input
                  id="reset-new-password"
                  type="password"
                  placeholder="Yeni şifrenizi girin"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  data-testid="input-reset-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-confirm-password">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="reset-confirm-password"
                  type="password"
                  placeholder="Yeni şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  data-testid="input-reset-confirm-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                data-testid="button-reset-password"
                disabled={isLoading}
              >
                {isLoading ? "Şifre değiştiriliyor..." : "Şifreyi Değiştir"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Giriş yapmak için{" "}
                <Link href="/giris" className="text-primary hover:underline">
                  buraya tıklayın
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
