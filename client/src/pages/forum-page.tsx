import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForumPostCard from "@/components/ForumPostCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";

export default function ForumPage() {
  const { user, logout } = useAuth();
  const [posts] = useState([
    {
      id: 1,
      title: "Yeni sezon başlıyor! Katılmak isteyen var mı?",
      content: "Merhaba arkadaşlar, yeni sezon için takım arıyorum. İyi bir savunma oyuncusuyum ve aktif olarak oynuyorum.",
      author: "futbolsever42",
      category: "Genel Sohbet",
      replyCount: 12,
      createdAt: "2 saat önce",
      isLocked: false,
      isArchived: false
    },
    {
      id: 2,
      title: "Takım başvurusu - Beşiktaş Espor",
      content: "Takımımızın logosu ve kadrosu hazır. Lig için başvurmak istiyoruz.",
      author: "bjk_admin",
      category: "Takım Başvuruları",
      replyCount: 3,
      createdAt: "5 saat önce",
      isLocked: true,
      isArchived: false
    },
    {
      id: 3,
      title: "VIP sistemi hakkında öneriler",
      content: "VIP sisteminde bazı iyileştirmeler yapılsa güzel olur. Özellikle Gold paket için...",
      author: "vipoyuncu",
      category: "Öneriler",
      replyCount: 8,
      createdAt: "1 gün önce",
      isLocked: false,
      isArchived: false
    },
    {
      id: 4,
      title: "Geçen sezonun en iyi maçı",
      content: "Galatasaray - Fenerbahçe final maçı gerçekten harikaydı. Son dakika golü...",
      author: "eskioyuncu",
      category: "Sözlük",
      replyCount: 45,
      createdAt: "2 gün önce",
      isLocked: false,
      isArchived: true
    }
  ]);

  const filterPostsByCategory = (category: string) => {
    if (category === "all") return posts;
    return posts.filter(post => {
      if (category === "team-applications") return post.category === "Takım Başvuruları";
      if (category === "suggestions") return post.category === "Öneriler";
      if (category === "general") return post.category === "Sözlük" || post.category === "Genel Sohbet";
      return true;
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2" data-testid="text-page-title">
                Forum
              </h1>
              <p className="text-muted-foreground">
                Toplulukla etkileşime geçin, sorularınızı sorun ve deneyimlerinizi paylaşın
              </p>
            </div>
            <Button className="hover-elevate active-elevate-2" data-testid="button-create-post">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Konu Aç
            </Button>
          </div>

          {!user && (
            <Alert className="mb-6">
              <Lock className="w-4 h-4" />
              <AlertDescription data-testid="text-login-required">
                Konu açmak ve yorum yapmak için giriş yapmanız gerekmektedir. Kayıtsız kullanıcılar sadece okuyabilir.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all">Tümü</TabsTrigger>
              <TabsTrigger value="team-applications" data-testid="tab-team-applications">Takım Başvuruları</TabsTrigger>
              <TabsTrigger value="suggestions" data-testid="tab-suggestions">Öneriler</TabsTrigger>
              <TabsTrigger value="general" data-testid="tab-general">Genel / Sözlük</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filterPostsByCategory("all").map((post) => (
                <ForumPostCard key={post.id} {...post} />
              ))}
            </TabsContent>

            <TabsContent value="team-applications" className="space-y-4">
              {filterPostsByCategory("team-applications").length > 0 ? (
                filterPostsByCategory("team-applications").map((post) => (
                  <ForumPostCard key={post.id} {...post} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-posts">
                    Bu kategoride henüz konu bulunmamaktadır.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              {filterPostsByCategory("suggestions").map((post) => (
                <ForumPostCard key={post.id} {...post} />
              ))}
            </TabsContent>

            <TabsContent value="general" className="space-y-4">
              {filterPostsByCategory("general").map((post) => (
                <ForumPostCard key={post.id} {...post} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer onlineCount={42} />
    </div>
  );
}
