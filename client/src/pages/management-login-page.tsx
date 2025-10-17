import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManagementLoginPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in as admin, redirect to management panel
  useEffect(() => {
    if (user?.isAdmin || user?.isSuperAdmin) {
      navigate("/yonetim");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
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
        setIsLoading(false);
        return;
      }

      const userData = await response.json();
      
      // Check if user is super admin
      if (!userData.isSuperAdmin) {
        toast({
          title: "Yetkisiz Erişim",
          description: "Sadece süper adminler yönetim paneline erişebilir",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Update auth context
      queryClient.setQueryData(["/api/auth/me"], userData);
      
      // Redirect to management panel
      toast({
        title: "Giriş Başarılı",
        description: "Yönetim paneline yönlendiriliyorsunuz",
      });
      navigate("/yonetim");
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Yönetim Paneli Girişi</CardTitle>
          <CardDescription>
            Yönetim paneline erişmek için admin hesabınızla giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Kullanıcı Adı
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Admin kullanıcı adınız"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                data-testid="input-management-username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Şifre
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Admin şifreniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-management-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-management-login"
            >
              {isLoading ? "Giriş yapılıyor..." : "Yönetim Paneline Giriş Yap"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              data-testid="button-back-home"
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
