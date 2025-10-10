import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActiveRoomCard from "@/components/ActiveRoomCard";
import ForumPostCard from "@/components/ForumPostCard";
import LiveChat from "@/components/LiveChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Trophy, Users, MessageSquare, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";

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

  const { data: forumPosts = [] } = useQuery<any[]>({
    queryKey: ["/api/forum-posts"],
  });

  const { data: recentUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/users/recent"],
  });

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
                <Button size="lg" className="hover-elevate active-elevate-2" data-testid="button-hero-rooms">
                  Aktif Odalara Katıl
                </Button>
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
              <Link href="/lig" data-testid="link-feature-league">
                <Card className="hover-elevate active-elevate-2 overflow-visible cursor-pointer">
                  <CardHeader>
                    <Trophy className="w-10 h-10 text-primary mb-2" />
                    <CardTitle>Aktif Lig</CardTitle>
                    <CardDescription>
                      Profesyonel lig sistemi ve istatistikler
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin-kadrosu" data-testid="link-feature-community">
                <Card className="hover-elevate active-elevate-2 overflow-visible cursor-pointer">
                  <CardHeader>
                    <Users className="w-10 h-10 text-primary mb-2" />
                    <CardTitle>Topluluk</CardTitle>
                    <CardDescription>
                      Aktif ve dostane oyuncu topluluğu
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/vip" data-testid="link-feature-vip">
                <Card className="hover-elevate active-elevate-2 overflow-visible cursor-pointer">
                  <CardHeader>
                    <Shield className="w-10 h-10 text-primary mb-2" />
                    <CardTitle>VIP Sistem</CardTitle>
                    <CardDescription>
                      Özel özellikler ve ayrıcalıklar
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/forum" data-testid="link-feature-forum">
                <Card className="hover-elevate active-elevate-2 overflow-visible cursor-pointer">
                  <CardHeader>
                    <MessageSquare className="w-10 h-10 text-primary mb-2" />
                    <CardTitle>Forum</CardTitle>
                    <CardDescription>
                      Aktif tartışma ve paylaşım platformu
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>

            <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {forumPosts.length > 0 && (
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-heading font-bold">Son Forum Konuları</h2>
                    <Link href="/forum">
                      <Button variant="ghost" className="hover-elevate active-elevate-2" data-testid="button-view-forum">
                        Foruma Git
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {forumPosts.slice(0, 2).map((post: any) => (
                      <ForumPostCard 
                        key={post.id} 
                        id={post.id}
                        title={post.title}
                        content={post.content}
                        author={post.user?.username || 'Bilinmeyen'}
                        authorRole={post.staffRole}
                        authorPlayerRole={post.user?.playerRole}
                        authorIsAdmin={post.user?.isAdmin}
                        authorIsSuperAdmin={post.user?.isSuperAdmin}
                        category={post.category}
                        replyCount={post.replyCount}
                        createdAt={formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="lg:col-span-1 space-y-6">
                <LiveChat />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Son Kayıt Olanlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentUsers.length > 0 ? (
                        recentUsers.slice(0, 5).map((user: any) => (
                          <Link key={user.id} href={`/profil/${user.id}`}>
                            <div className="flex items-center justify-between p-2 rounded-lg hover-elevate cursor-pointer" data-testid={`recent-user-${user.id}`}>
                              <div>
                                <p className="font-medium text-sm">{user.username}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: tr })}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Henüz kayıt yok
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
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

      <Footer />
    </div>
  );
}
