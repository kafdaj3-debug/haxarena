import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl } from "@/lib/queryClient";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = buildApiUrl("/api/auth/login");
      console.log("🔗 Login API URL:", apiUrl);
      
      // Timeout ekle (30 saniye - Render free tier yavaş olabilir)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(loginData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Bilinmeyen hata" }));
        toast({
          title: "Giriş Başarısız",
          description: error.error || "Kullanıcı adı veya şifre hatalı",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await response.json();
      toast({
        title: "Giriş Başarılı",
        description: "Hoş geldiniz!",
      });
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Bir hata oluştu, lütfen tekrar deneyin";
      
      if (error.name === "AbortError") {
        errorMessage = "Backend yanıt vermiyor. Backend'in çalıştığından ve Render'da aktif olduğundan emin olun. (Render free tier ilk istekte yavaş olabilir)";
      } else if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        errorMessage = "Backend'e bağlanılamıyor. Backend'in çalıştığından emin olun.";
      } else if (error.message?.includes("CORS")) {
        errorMessage = "CORS hatası. Backend CORS ayarlarını kontrol edin.";
      }
      
      toast({
        title: "Bağlantı Hatası",
        description: errorMessage,
        variant: "destructive",
      });
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
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>
              Hesabınıza giriş yaparak devam edin
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Kullanıcı Adı</Label>
                <Input
                  id="login-username"
                  type="text"
                  placeholder="Kullanıcı adınızı girin"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                  data-testid="input-login-username"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Şifre</Label>
                  <Link href="/sifre-sifirlama" className="text-xs text-primary hover:underline">
                    Şifremi Unuttum
                  </Link>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Şifrenizi girin"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  data-testid="input-login-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                data-testid="button-login"
                disabled={isLoading}
              >
                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Hesabınız yok mu?{" "}
                <Link href="/kayit" className="text-primary hover:underline">
                  Kayıt Ol
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
