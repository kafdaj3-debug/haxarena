import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "" });
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Giriş Başarısız",
          description: error.error || "Kullanıcı adı veya şifre hatalı",
          variant: "destructive",
        });
        return;
      }

      await response.json();
      toast({
        title: "Giriş Başarılı",
        description: "Hoş geldiniz!",
      });
      window.location.href = "/";
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(registerData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        let errorMessage = "Kayıt işlemi başarısız oldu";
        
        if (error.error && error.error.includes("username")) {
          errorMessage = "Bu kullanıcı adı zaten kullanılıyor";
        }
        
        toast({
          title: "Kayıt Başarısız",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      setRegisterSuccess(true);
      setRegisterData({ username: "", password: "" });
      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu, şimdi giriş yapabilirsiniz",
      });
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
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl">
          <Link href="/" className="flex items-center justify-center mb-12">
            <div className="text-3xl font-heading font-bold text-primary">
              HaxArena V6
            </div>
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
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
                    <Label htmlFor="login-password">Şifre</Label>
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
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    data-testid="button-login"
                    disabled={isLoading}
                  >
                    {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

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
                        Kaydınız yetkililere iletilmiştir. Onay sürecinin tamamlanmasının ardından giriş yapabilirsiniz.
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
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    data-testid="button-register"
                    disabled={isLoading}
                  >
                    {isLoading ? "Kayıt olunuyor..." : "Kayıt Ol"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-card items-center justify-center p-8 border-l">
        <div className="max-w-md text-center space-y-6">
          <h2 className="text-3xl font-heading font-bold">
            HaxArena V6 Real Soccer
          </h2>
          <p className="text-lg text-muted-foreground">
            Türkiye'nin en büyük HaxBall Real Soccer topluluğuna katılın
          </p>
          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <span>Profesyonel lig sistemi ve turnuvalar</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <span>Aktif oyuncu topluluğu ve Discord sunucusu</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <span>VIP sistemleri ve özel özellikler</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <span>Adil ve profesyonel yönetim</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
