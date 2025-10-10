import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LeaguePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-4" data-testid="text-page-title">
              Lig
            </h1>
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription data-testid="text-league-info">
                Şu anda aktif bir lig sezonumuz bulunmamaktadır. Yeni sezon duyuruları için Discord kanalımızı takip edin.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
