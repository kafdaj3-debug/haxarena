import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl, queryClient } from "@/lib/queryClient";

export default function RegisterPage() {
  const [registerData, setRegisterData] = useState({ username: "", password: "" });
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = buildApiUrl("/api/auth/register");
      console.log("🔗 Register API URL:", apiUrl);
      
      // Timeout ekle (30 saniye - Render free tier yavaş olabilir)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(registerData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Bilinmeyen hata" }));
        const errorMessage = error.error || "Kayıt işlemi başarısız oldu";
        
        setRegisterSuccess(false);
        toast({
          title: "Kayıt Başarısız",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userData = await response.json();
      
      // JWT token'ı localStorage'a kaydet
      if (userData.token) {
        localStorage.setItem('auth_token', userData.token);
        console.log("✅ Register - JWT token saved to localStorage");
      }

      // Auth context'i güncelle
      queryClient.setQueryData(["/api/auth/me"], userData);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

      setRegisterSuccess(true);
      setRegisterData({ username: "", password: "" });
      
      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu ve giriş yaptınız!",
      });

      // Ana sayfaya yönlendir
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: any) {
      console.error("Register error:", error);
      
      setRegisterSuccess(false);
      
      let errorMessage = "Bir hata oluştu, lütfen tekrar deneyin";
      
      if (error.name === "AbortError") {
        errorMessage = "İstek zaman aşımına uğradı. Backend'e bağlanılamıyor.";
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
            <CardTitle>Kayıt Ol</CardTitle>
            <CardDescription>
              Yeni hesap oluşturun
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {registerSuccess && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription data-testid="text-register-success">
                    Kayıt başarılı! Ana sayfaya yönlendiriliyorsunuz...
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="register-username">Kullanıcı Adı</Label>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="Kullanıcı adı seçin"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                  data-testid="input-register-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Şifre</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Güçlü bir şifre oluşturun"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  data-testid="input-register-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                data-testid="button-register"
                disabled={isLoading}
              >
                {isLoading ? "Kayıt olunuyor..." : "Kayıt Ol"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                <Link href="/giris" className="text-primary hover:underline">
                  Giriş Yap
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
