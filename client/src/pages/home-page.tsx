import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActiveRoomCard from "@/components/ActiveRoomCard";
import ForumPostCard from "@/components/ForumPostCard";
import LiveChat from "@/components/LiveChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Trophy, MessageSquare, Shield, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function HomePage() {
  const { user, logout } = useAuth();
  const allRooms = [
    {
      matchName: "Galatasaray vs Fenerbahçe",
      link: "https://www.haxball.com/play?c=ypTYXP0WvG4"
    },
    {
      matchName: "Karşıyaka vs Göztepe",
      link: "https://www.haxball.com/play?c=ZkcM_hKao5I"
    },
    {
      matchName: "Kocaelispor vs Gaziantepspor",
      link: "https://www.haxball.com/play?c=NOeHL2fPZ1o"
    }
  ];

  const preparationRooms = [
    {
      matchName: "HaxArena Hazırlık Odası 1",
      link: "https://www.haxball.com/play?c=wqcQAOMDnVE"
    },
    {
      matchName: "HaxArena Hazırlık Odası 2",
      link: "https://www.haxball.com/play?c=TOVMlpm27eE"
    },
    {
      matchName: "HaxArena Hazırlık Odası 3",
      link: "https://www.haxball.com/play?c=XYTmREWQVcE"
    },
    {
      matchName: "HaxArena Hazırlık Odası 4",
      link: "https://www.haxball.com/play?c=Dvp_81Dn9wc"
    }
  ];

  const { data: forumPosts = [] } = useQuery<any[]>({
    queryKey: ["/api/forum-posts"],
  });

  const { data: leaderboard = [] } = useQuery<any[]>({
    queryKey: ["/api/league/stats/leaderboard"],
  });

  const topScorers = leaderboard
    .sort((a, b) => b.totalGoals - a.totalGoals)
    .slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-card to-background py-12 md:py-20 border-b">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold mb-4 md:mb-6" data-testid="text-hero-title">
              HaxArena V6 Real Soccer'e
              <span className="block text-primary mt-2">Hoş Geldiniz</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Türkiye'nin en büyük HaxBall Real Soccer topluluğu
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
              <Link href="/aktif-odalar" className="w-full sm:w-auto">
                <Button size="lg" className="hover-elevate active-elevate-2 w-full sm:w-auto" data-testid="button-hero-rooms">
                  Aktif Odalara Katıl
                </Button>
              </Link>
              <a href="https://discord.gg/haxarena" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="hover-elevate active-elevate-2 w-full sm:w-auto" data-testid="button-hero-discord">
                  Discord'a Katıl
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Gazete Bölümü */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-amber-50/5 to-amber-50/10 dark:from-amber-950/10 dark:to-amber-950/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Gazete Kağıdı Efekti */}
              <div className="relative bg-gradient-to-br from-amber-50 via-amber-50/95 to-amber-100/90 dark:from-amber-900/30 dark:via-amber-900/20 dark:to-amber-800/30 border-4 border-amber-800/30 dark:border-amber-700/40 shadow-2xl p-6 md:p-10 lg:p-12 transform rotate-0 hover:rotate-0 transition-all duration-300">
                {/* Eski kağıt dokusu efekti */}
                <div className="absolute inset-0 opacity-10 dark:opacity-5" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundSize: '200px 200px'
                }}></div>
                
                {/* Gazete Başlığı */}
                <div className="relative border-b-4 border-black dark:border-amber-100 pb-3 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <div className="text-xs md:text-sm font-mono text-black/70 dark:text-amber-200/70">
                      {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-xs md:text-sm font-mono text-black/70 dark:text-amber-200/70">
                      Fiyat: 2.50 TL
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    HAXARENA GAZETESİ
                  </h2>
                  <div className="text-center text-xs md:text-sm mt-2 text-black/60 dark:text-amber-200/60 font-serif italic">
                    Türkiye'nin En Büyük HaxBall Real Soccer Haber Kaynağı
                  </div>
                </div>

                {/* Ana Başlık ve Görsel */}
                <div className="relative mb-6">
                  <div className="mb-3">
                    <span className="inline-block bg-red-600 dark:bg-red-700 text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                      Özel Haber
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight text-red-700 dark:text-red-400" style={{ fontFamily: "'Playfair Display', serif" }}>
                    📰 ŞOK ŞOK ŞOK! Ligin Gol Kralı Cassé Sırra Kadem Bastı!
                  </h1>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 text-black/90 dark:text-amber-100/90 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Los Infiernos'un yıldız futbolcusu Cassé, adeta "topu aldı, şehirden çıktı" diyerek ortadan kayboldu!
                  </h2>
                  <div className="w-full h-64 md:h-96 bg-gradient-to-br from-red-600/20 via-orange-500/20 to-yellow-500/20 dark:from-red-900/40 dark:via-orange-900/30 dark:to-yellow-900/30 rounded-lg mb-4 overflow-hidden relative border-2 border-red-800/30 dark:border-red-600/40">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-6xl md:text-8xl mb-4">🔍</div>
                        <p className="text-lg md:text-xl font-serif text-black/90 dark:text-amber-100/90 font-bold">
                          "Nerede Olduğu Bilinmiyor!"
                        </p>
                        <p className="text-sm md:text-base font-serif text-black/70 dark:text-amber-200/70 mt-2 italic">
                          Los Infiernos taraftarları güne şokla uyandı
                        </p>
                      </div>
                    </div>
                    {/* Görsel üzerine overlay efekti */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                  <p className="text-xs md:text-sm text-black/60 dark:text-amber-200/60 font-serif italic mb-4">
                    Fotoğraf: Los Infiernos Kulübü - Cassé'nin Son Görüldüğü Yer
                  </p>
                </div>

                {/* İçerik Kolonları */}
                <div className="relative mb-6">
                  <div className="mb-4 pb-2 border-b-2 border-black/30 dark:border-amber-200/30">
                    <h3 className="text-xl md:text-2xl font-bold text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Haberin Ayrıntıları:
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6">
                    <div className="space-y-4">
                      <p className="text-base md:text-lg leading-relaxed font-serif text-black/90 dark:text-amber-100/90" style={{ fontFamily: "'Crimson Text', serif" }}>
                        <span className="text-4xl md:text-5xl float-left mr-2 leading-none font-bold text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>L</span>
                        os Infiernos taraftarları güne şokla uyandı. Ligin gol kralı Cassé, dün akşam antrenmandan sonra "bir hava alıp geleceğim" diyerek tesislerden çıktı ve… bir daha dönmedi!
                      </p>
                      <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-600 dark:border-red-500 p-4 mt-4">
                        <p className="text-base md:text-lg font-bold text-red-800 dark:text-red-300 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Nerede olduğu bilinmiyor:
                        </p>
                        <p className="text-sm md:text-base font-serif text-black/80 dark:text-amber-200/80" style={{ fontFamily: "'Crimson Text', serif" }}>
                          Kulüp yetkilileri, Cassé'nin izini sürmek için GPS, drone ve mahalle bekçilerine kadar her kaynağı devreye soktu ama sonuç: koskoca bir hiç!
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-600 dark:border-orange-500 p-4">
                        <p className="text-base md:text-lg font-bold text-orange-800 dark:text-orange-300 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Telefonları açmıyor:
                        </p>
                        <p className="text-sm md:text-base font-serif text-black/80 dark:text-amber-200/80" style={{ fontFamily: "'Crimson Text', serif" }}>
                          Menajeri, "Son aramamda çaldı, sonra bir daha çalmadı… muhtemelen şarjı bitti ya da beni görünce kapattı." diyerek durumu özetledi.
                        </p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-600 dark:border-yellow-500 p-4 mt-4">
                        <p className="text-base md:text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Taraftar panikte:
                        </p>
                        <p className="text-sm md:text-base font-serif text-black/80 dark:text-amber-200/80" style={{ fontFamily: "'Crimson Text', serif" }}>
                          Sosyal medyada taraftarlar <span className="font-bold text-primary">#CasséNerede</span> etiketiyle kampanya başlattı. Bazı kullanıcılar oyuncunun Mars'a taşındığını, bazıları ise gizlice başka takımlarla görüşmeye gittiğini iddia ediyor.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alt Bölümler */}
                <div className="relative border-t-2 border-black/20 dark:border-amber-200/20 pt-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 border-b border-black/20 dark:border-amber-200/20 pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Gol Krallığı
                      </h3>
                      <p className="text-sm md:text-base font-serif text-black/80 dark:text-amber-200/80" style={{ fontFamily: "'Crimson Text', serif" }}>
                        Ligin en golcü oyuncuları bu hafta da formlarını koruyor. İlk 5 sırada yer alan oyuncular, toplam 200'den fazla gol atmış durumda.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 border-b border-black/20 dark:border-amber-200/20 pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Aktif Odalar
                      </h3>
                      <p className="text-sm md:text-base font-serif text-black/80 dark:text-amber-200/80" style={{ fontFamily: "'Crimson Text', serif" }}>
                        Günlük ortalama 50+ aktif oda ile topluluk, 7/24 kesintisiz maç imkanı sunuyor. Hazırlık odaları da yoğun ilgi görüyor.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 border-b border-black/20 dark:border-amber-200/20 pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Forum Aktiviteleri
                      </h3>
                      <p className="text-sm md:text-base font-serif text-black/80 dark:text-amber-200/80" style={{ fontFamily: "'Crimson Text', serif" }}>
                        Forum bölümünde son 24 saatte 100+ yeni konu açıldı. Topluluk üyeleri aktif bir şekilde tartışmalara katılıyor.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alt Bilgi */}
                <div className="relative border-t border-black/10 dark:border-amber-200/10 pt-4 mt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs md:text-sm font-mono text-black/50 dark:text-amber-200/50">
                    <div>Sayfa 1 | HaxArena V6 Real Soccer</div>
                    <div>www.haxarena.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Duyuru Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_3s_infinite]"></div>
          <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                    35.000 TL Ödüllü Lig Başvuruları Devam Ediyor!
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Lige katılmak ve detayları öğrenmek için Discord sunucumuza hemen katıl!
                  </p>
                </div>
              </div>
              <a 
                href="https://discord.gg/haxarena" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Button 
                  size="lg" 
                  className="hover-elevate active-elevate-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
                  data-testid="button-announcement-discord"
                >
                  Discord'a Katıl
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </div>
          </div>
          <style>{`
            @keyframes shimmer {
              0% { background-position: -1000px 0; }
              100% { background-position: 1000px 0; }
            }
          `}</style>
        </section>

        <section className="py-8 md:py-16 bg-background">
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

              <Link href="/lig?tab=goals" data-testid="link-feature-top-scorers">
                <Card className="hover-elevate active-elevate-2 overflow-visible cursor-pointer">
                  <CardHeader>
                    <Trophy className="w-10 h-10 text-primary mb-2" />
                    <CardTitle>⚽ Gol Krallığı</CardTitle>
                    <CardDescription>
                      Ligin en golcü oyuncularını keşfedin
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>

            <div className="mb-8 md:mb-12 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {forumPosts.length > 0 && (
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-2xl md:text-3xl font-heading font-bold">Son Forum Konuları</h2>
                    <Link href="/forum">
                      <Button variant="ghost" className="hover-elevate active-elevate-2 text-sm md:text-base" data-testid="button-view-forum">
                        Foruma Git
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {forumPosts.slice(0, 2).map((post: any) => (
                      <ForumPostCard 
                        key={post.id} 
                        id={post.id}
                        title={post.title}
                        content={post.content}
                        author={post.user?.username || 'Bilinmeyen'}
                        authorProfilePicture={post.user?.profilePicture}
                        authorRole={post.staffRole}
                        authorPlayerRole={post.user?.playerRole}
                        authorIsAdmin={post.user?.isAdmin}
                        authorIsSuperAdmin={post.user?.isSuperAdmin}
                        authorCustomRoles={post.customRoles}
                        category={post.category}
                        replyCount={post.replyCount}
                        createdAt={formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="lg:col-span-1">
                <LiveChat />
              </div>
            </div>

            <div className="space-y-8 md:space-y-12">
              {/* Maç Odaları */}
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 md:mb-6">Maç Odaları</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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

              {/* Hazırlık Odaları */}
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 md:mb-6">Hazırlık Odaları</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {preparationRooms.map((room, index) => (
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
