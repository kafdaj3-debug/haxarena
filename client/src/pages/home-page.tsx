import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActiveRoomCard from "@/components/ActiveRoomCard";
import ForumPostCard from "@/components/ForumPostCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Trophy, Users, MessageSquare, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user, logout } = useAuth();
  const allRooms = [
    {
      matchName: "Beşiktaş vs Trabzonspor",
      link: "https://www.haxball.com/play?c=S94fRiqX_MI"
    },
    {
      matchName: "Kocaelispor vs Gaziantepspor",
      link: "https://www.haxball.com/play?c=SQiZbOZdvCU"
    },
    {
      matchName: "Karşıyaka vs Göztepe",
      link: "https://www.haxball.com/play?c=0nc3iNzdT78"
    },
    {
      matchName: "Galatasaray vs Fenerbahçe",
      link: "https://www.haxball.com/play?c=tIJcy9L3c0k"
    }
  ];

  const recentPosts = [
    {
      id: 1,
      title: "Yeni sezon başlıyor! Katılmak isteyen var mı?",
      content: "Merhaba arkadaşlar, yeni sezon için takım arıyorum. İyi bir savunma oyuncusuyum ve aktif olarak oynuyorum.",
      author: "futbolsever42",
      category: "Genel Sohbet",
      replyCount: 12,
      createdAt: "2 saat önce"
    },
    {
      id: 2,
      title: "Takım başvurusu - Beşiktaş Espor",
      content: "Takımımızın logosu ve kadrosu hazır. Lig için başvurmak istiyoruz.",
      author: "bjk_admin",
      category: "Takım Başvuruları",
      replyCount: 3,
      createdAt: "5 saat önce"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-card to-background py-20 border-b">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6" data-testid="text-hero-title">
              HaxArena V6 Real Soccer'e
              <span className="block text-primary mt-2">Hoş Geldiniz</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Türkiye'nin en büyük HaxBall Real Soccer topluluğu
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/aktif-odalar">
                <a>
                  <Button size="lg" className="hover-elevate active-elevate-2" data-testid="button-hero-rooms">
                    Aktif Odalara Katıl
                  </Button>
                </a>
              </Link>
              <a href="https://discord.gg/haxarena" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="hover-elevate active-elevate-2" data-testid="button-hero-discord">
                  Discord'a Katıl
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="hover-elevate overflow-visible">
                <CardHeader>
                  <Trophy className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Aktif Lig</CardTitle>
                  <CardDescription>
                    Profesyonel lig sistemi ve istatistikler
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-elevate overflow-visible">
                <CardHeader>
                  <Users className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Topluluk</CardTitle>
                  <CardDescription>
                    Aktif ve dostane oyuncu topluluğu
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-elevate overflow-visible">
                <CardHeader>
                  <Shield className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>VIP Sistem</CardTitle>
                  <CardDescription>
                    Özel özellikler ve ayrıcalıklar
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-elevate overflow-visible">
                <CardHeader>
                  <MessageSquare className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Forum</CardTitle>
                  <CardDescription>
                    Aktif tartışma ve paylaşım platformu
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-heading font-bold">Son Forum Konuları</h2>
                <Link href="/forum">
                  <Button variant="ghost" className="hover-elevate active-elevate-2" data-testid="button-view-forum">
                    Foruma Git
                  </Button>
                </Link>
              </div>
              <div className="space-y-4 max-w-4xl">
                {recentPosts.map((post) => (
                  <ForumPostCard key={post.id} {...post} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">Aktif Odalar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {allRooms.map((room, index) => (
                  <ActiveRoomCard
                    key={index}
                    matchName={room.matchName}
                    link={room.link}
                    isActive={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onlineCount={42} />
    </div>
  );
}
