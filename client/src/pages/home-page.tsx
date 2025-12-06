import { useState, useEffect, useMemo } from "react";
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

  // Fikstür verilerini çek
  const { data: fixtures, isLoading: fixturesLoading } = useQuery<any[]>({
    queryKey: ["/api/league/fixtures"],
  });

  // Takım verilerini çek (puan durumu için)
  const { data: teams, isLoading: teamsLoading } = useQuery<any[]>({
    queryKey: ["/api/league/teams"],
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<any[]>({
    queryKey: ["/api/league/stats/leaderboard"],
  });

  // Tüm gazete verileri yüklenene kadar bekle
  const isNewspaperDataLoading = fixturesLoading || teamsLoading || leaderboardLoading;

  // Hesaplamaları memoize et - sadece veriler yüklendiğinde hesapla
  const newspaperData = useMemo(() => {
    if (!fixtures || !teams || !leaderboard) {
      return {
        december2Matches: [],
        highScoringMatches: [],
        leagueLeader: null,
        goalLeader: null,
        goalLeaders: [],
        hasMultipleLeaders: false,
        topGoalCount: 0,
      };
    }

    // Aralık 2 tarihinde oynanan maçları filtrele (hükmen olanlar hariç)
    const december2Matches = fixtures.filter((fixture: any) => {
      if (!fixture.matchDate || fixture.isBye || fixture.isForfeit) return false;
      const matchDate = new Date(fixture.matchDate);
      // Aralık 2 tarihini kontrol et (yıl önemli değil, sadece ay ve gün)
      return matchDate.getMonth() === 11 && matchDate.getDate() === 2 && fixture.isPlayed;
    });

    // Bol gollü maçları bul (toplam 5 veya daha fazla gol)
    const highScoringMatches = december2Matches.filter((fixture: any) => {
      const totalGoals = (fixture.homeScore || 0) + (fixture.awayScore || 0);
      return totalGoals >= 5;
    });

    // Puan durumu lideri
    const leagueLeader = teams.length > 0 ? teams[0] : null;

    // Gol liderleri (eşit sayıda golü olanlar)
    const sortedGoalLeaders = leaderboard
      .filter((p: any) => p.totalGoals > 0)
      .sort((a: any, b: any) => b.totalGoals - a.totalGoals);
    
    const topGoalCount = sortedGoalLeaders.length > 0 ? sortedGoalLeaders[0].totalGoals : 0;
    const goalLeaders = sortedGoalLeaders.filter((p: any) => p.totalGoals === topGoalCount);
    
    const goalLeader = goalLeaders.length > 0 ? goalLeaders[0] : null;
    const hasMultipleLeaders = goalLeaders.length > 1;

    return {
      december2Matches,
      highScoringMatches,
      leagueLeader,
      goalLeader,
      goalLeaders,
      hasMultipleLeaders,
      topGoalCount,
    };
  }, [fixtures, teams, leaderboard]);

  const { december2Matches, highScoringMatches, leagueLeader, goalLeader, goalLeaders, hasMultipleLeaders, topGoalCount } = newspaperData;
  const allRooms = [
    {
      matchName: "Galatasaray vs Fenerbahçe",
      link: "https://www.haxball.com/play?c=VTSdPjjhQR4"
    },
    {
      matchName: "Karşıyaka vs Göztepe",
      link: "https://www.haxball.com/play?c=QktKkxbQu2c"
    },
    {
      matchName: "Kocaelispor vs Gaziantepspor",
      link: "https://www.haxball.com/play?c=os5zawLMUJA"
    }
  ];

  const preparationRooms = [
    {
      matchName: "HaxArena Hazırlık Odası 1",
      link: "https://www.haxball.com/play?c=_R4H-AKXKXs"
    },
    {
      matchName: "HaxArena Hazırlık Odası 2",
      link: "https://www.haxball.com/play?c=fadru3fscic"
    },
    {
      matchName: "HaxArena Hazırlık Odası 3",
      link: "https://www.haxball.com/play?c=bNclxMUv1rY"
    },
    {
      matchName: "HaxArena Hazırlık Odası 4",
      link: "https://www.haxball.com/play?c=4vZhwo4j50c"
    }
  ];

  const { data: forumPosts = [] } = useQuery<any[]>({
    queryKey: ["/api/forum-posts"],
  });


  const topScorers = leaderboard
    .sort((a, b) => b.totalGoals - a.totalGoals)
    .slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-card to-background py-12 md:py-20 border-b new-year-gradient overflow-hidden">
          {/* Yılbaşı dekorasyonları */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-10 left-10 text-yellow-400 text-4xl sparkle">✨</span>
            <span className="absolute top-20 right-20 text-red-500 text-3xl twinkle">🎄</span>
            <span className="absolute bottom-20 left-20 text-green-500 text-4xl float">🎁</span>
            <span className="absolute top-40 right-40 text-yellow-300 text-3xl twinkle">⭐</span>
            <span className="absolute bottom-40 right-10 text-red-400 text-4xl sparkle">🎊</span>
            <span className="absolute top-60 left-1/4 text-green-400 text-3xl float">🎈</span>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="mb-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold mb-4 md:mb-6" data-testid="text-hero-title">
                <span className="bg-gradient-to-r from-red-500 via-green-500 to-yellow-500 bg-clip-text text-transparent sparkle">
                  Mutlu Yıllar! 🎄✨
                </span>
                <span className="block mt-2 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold text-2xl sm:text-3xl md:text-4xl sparkle">
                  HaxArena V6 Real Soccer'e Hoş Geldiniz
                </span>
              </h1>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              <span className="inline-block twinkle">🎄</span> Türkiye'nin en büyük HaxBall Real Soccer topluluğu <span className="inline-block twinkle">🎄</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
              <Link href="/aktif-odalar" className="w-full sm:w-auto">
                <Button size="lg" className="hover-elevate active-elevate-2 w-full sm:w-auto bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white shadow-lg glow" data-testid="button-hero-rooms">
                  <span className="mr-2">🎮</span> Aktif Odalara Katıl
                </Button>
              </Link>
              <a href="https://discord.gg/haxarena" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="hover-elevate active-elevate-2 w-full sm:w-auto border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-white" data-testid="button-hero-discord">
                  <span className="mr-2">🎉</span> Discord'a Katıl
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Gazete Bölümü */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-amber-50/5 to-amber-50/10 dark:from-amber-950/10 dark:to-amber-950/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              
              {/* Loading State */}
              {isNewspaperDataLoading ? (
                <div className="relative bg-gradient-to-br from-amber-50 via-amber-50/95 to-amber-100/90 dark:from-amber-900/30 dark:via-amber-900/20 dark:to-amber-800/30 border-4 border-amber-800/30 dark:border-amber-700/40 shadow-2xl p-6 md:p-10 lg:p-12">
                  <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 dark:border-amber-200 mb-4"></div>
                    <p className="text-lg font-serif text-black dark:text-amber-100">Gazete yükleniyor...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Yeni Gazete */}
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
                    📰 SPOR EKSPRES
                  </h2>
                  <div className="text-center text-xs md:text-sm mt-2 text-black/60 dark:text-amber-200/60 font-serif italic">
                    "Gol Fırtınası, Mizah Dalgası!"
                  </div>
                </div>

                {/* Ana Başlık */}
                <div className="mb-6">
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Gol Fırtınası, Mizah Dalgası!
                  </h1>
                </div>

                {/* Haftanın Süperstarı: AEJEN */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-500 dark:border-yellow-400 p-4 md:p-6 rounded-lg">
                    <div className="mb-3">
                      <span className="inline-block bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                        ⭐ Haftanın Süperstarı
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold mb-3 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                      AEJEN – Holstein Kiel'in Yürüyen Çekici Kuvveti
                    </h2>
                    <div className="space-y-3">
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Holstein Kiel bu hafta da coştu, 4/4 yaparak resmen "Biz şampiyonluk trenini sürdürüyoruz, binmeyen koşsun" mesajı verdi.
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Bu başarıyı kim sürüklüyor?
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Tabii ki sahada fizik kurallarını büküp rakip savunmayı mikrodalgada ısıtır gibi dağıtan Aején.
                      </p>
                      <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-yellow-500 dark:border-yellow-400 p-3 mt-3">
                        <p className="text-sm md:text-base font-bold text-black dark:text-amber-100 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                          "Aején'i tutmak için üç kişiyi gönderdik, üçü de geri dönmedi."
                        </p>
                        <p className="text-xs text-black/70 dark:text-amber-200/70 italic">— Manifest'in analiz ekibi</p>
                      </div>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Holstein Kiel tarafında herkes keyifli, hatta kulübün sosyal medya yöneticisi bile "İki saatlik Aején highlights videosu hazırladım, paylaşmaya elim titriyor," dedi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Los Infiernos */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-500 dark:border-red-400 p-4 md:p-6 rounded-lg">
                    <div className="mb-3">
                      <span className="inline-block bg-red-500 dark:bg-red-600 text-white dark:text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                        🔥 Los Infiernos
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold mb-3 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                      4/4 ve Alev Alev!
                    </h2>
                    <div className="space-y-3">
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Los Infiernos da haftayı 4/4 yaparak tamamladı.
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Nasıl mı?
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                        "Rakip kim?" diye bakmadan her maç 8 soyma, 12 dilimleme modunda sahaya çıkarak.
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Shamrock Rovers maçında 12 gol atarak öyle bir mesaj verdiler ki, rakip tribünleri maç sonunda "biz nereye geldik?" diye birbirine bakarken buldular.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shamrock Rovers */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-500 dark:border-gray-400 p-4 md:p-6 rounded-lg">
                    <div className="mb-3">
                      <span className="inline-block bg-gray-500 dark:bg-gray-600 text-white dark:text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                        😬 Shamrock Rovers
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold mb-3 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Gelen Geçen Saldırıyor, Gol Atan Atana
                    </h2>
                    <div className="space-y-3">
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Shamrock Rovers'ın durumu gerçekten… hmmm…
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Hani bazı oyunlarda zorluk seviyesi yanlışlıkla "Acemi Bot"a alınır ya?
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                        İşte öyle.
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Son haftalarda kim gelmişse gol atmış, kimi bulmuşsa vurmuş.
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Bir ara rakip forvetlerin aralarında "kendi aramızda paylaşalım, ayıp olmasın şimdi" diye konuştuğu bile iddia edildi.
                      </p>
                      <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-500 dark:border-gray-400 p-3 mt-3">
                        <p className="text-sm md:text-base font-bold text-black dark:text-amber-100 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                          "Eldivenleri artık yıkamıyorum, yırtılıyor. Direkt yenisini alıyorum."
                        </p>
                        <p className="text-xs text-black/70 dark:text-amber-200/70 italic">— Shamrock'ın kalecisi</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Antiran */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-500 dark:border-orange-400 p-4 md:p-6 rounded-lg">
                    <div className="mb-3">
                      <span className="inline-block bg-orange-500 dark:bg-orange-600 text-white dark:text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                        🐂⚔ ANTIRAN
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold mb-3 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Haftanın Davet Edilmemiş Patronu
                    </h2>
                    <div className="space-y-3">
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Antiran tam bir gizli favori vibe'ı veriyor… ama artık gizli falan değiller: adamlar çok iyiler.
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        FC Toros Bravos maçında 6 gol atıp "Biz buradayız kardeşim, hem de çok ciddiyiz" dediler.
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Cristiano'nun 2 gol + 1 kendi kalesine gol karışık menülü performansı bile takımı yavaşlatamadı, kül yutmayan bir hücum merkezi var.
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Retegui, Pablo Martín, Cristiano…
                      </p>
                      <p className="text-sm md:text-base leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Bu üçlü sahada öyle bir dolaşıyor ki, rakip savunma "ben bunu daha önce hesaplamamıştım" diye titreye titreye duruyor.
                      </p>
                      <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-orange-500 dark:border-orange-400 p-3 mt-3">
                        <p className="text-sm md:text-base font-bold text-black dark:text-amber-100 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                          "Takım bu formda giderse, sezon sonu kupa almaya değil, kupa seçmeye gideriz."
                        </p>
                        <p className="text-xs text-black/70 dark:text-amber-200/70 italic">— Teknik direktör</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Genel Durum */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-500 dark:border-blue-400 p-4 md:p-6 rounded-lg">
                    <div className="mb-3">
                      <span className="inline-block bg-blue-500 dark:bg-blue-600 text-white dark:text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                        🌪 Genel Durum
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold mb-3 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Kısa Özet, Uzun Mizah
                    </h2>
                    <div className="space-y-3">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-green-500">
                        <p className="text-sm md:text-base font-bold text-black dark:text-amber-100 mb-1">
                          Holstein Kiel → 4/4
                        </p>
                        <p className="text-xs md:text-sm text-black/80 dark:text-amber-200/80">
                          Rakipleri adeta "Sana gol göstereceğim" belgeseli izliyor.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-red-500">
                        <p className="text-sm md:text-base font-bold text-black dark:text-amber-100 mb-1">
                          Los Infiernos → 4/4
                        </p>
                        <p className="text-xs md:text-sm text-black/80 dark:text-amber-200/80">
                          Gol atmak onlar için yürüyüş yapmak kadar doğal.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-gray-500">
                        <p className="text-sm md:text-base font-bold text-black dark:text-amber-100 mb-1">
                          Shamrock Rovers → 0/sonsuz
                        </p>
                        <p className="text-xs md:text-sm text-black/80 dark:text-amber-200/80">
                          Rakip seçmiyorlar, herkese gol ikram ediyorlar.
                        </p>
                        <p className="text-xs md:text-sm text-black/80 dark:text-amber-200/80 italic mt-1">
                          Savunma: "Bizim branş yanlış olabilir mi?"
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-orange-500">
                        <p className="text-sm md:text-base font-bold text-black dark:text-amber-100 mb-1">
                          Antiran → tehlikeli derecede formda
                        </p>
                        <p className="text-xs md:text-sm text-black/80 dark:text-amber-200/80">
                          Hani biri gelir, kapıyı çalmaz, direkt içeri girer ya…
                        </p>
                        <p className="text-xs md:text-sm text-black/80 dark:text-amber-200/80 font-bold mt-1">
                          İşte Antiran o takım.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alt Bilgi */}
                <div className="relative border-t border-black/10 dark:border-amber-200/10 pt-4 mt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs md:text-sm font-mono text-black/50 dark:text-amber-200/50">
                    <div>HaxArena V6 Real Soccer</div>
                    <div>haxarena.web.tr</div>
                  </div>
                </div>
                </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Duyuru Banner - Yılbaşı Temalı */}
        <section className="relative overflow-hidden bg-gradient-to-r from-red-500/20 via-green-500/20 to-yellow-500/20 border-y-2 border-red-400/30 new-year-gradient">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_3s_infinite]"></div>
          {/* Yılbaşı dekorasyonları */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-2 left-10 text-yellow-300 text-2xl sparkle">✨</span>
            <span className="absolute bottom-2 right-20 text-red-400 text-xl twinkle">🎄</span>
            <span className="absolute top-4 right-40 text-green-400 text-2xl float">🎁</span>
          </div>
          <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-red-500/30 to-green-500/30 flex items-center justify-center animate-pulse glow">
                    <span className="text-2xl md:text-3xl sparkle">🎉</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                    <span className="inline-block twinkle">🎄</span> 35.000 TL Ödüllü Lig Başvuruları Devam Ediyor! <span className="inline-block twinkle">🎄</span>
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Yeni yılda da birlikte! Lige katılmak ve detayları öğrenmek için Discord sunucumuza hemen katıl!
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
                  className="hover-elevate active-elevate-2 bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group glow"
                  data-testid="button-announcement-discord"
                >
                  <span className="mr-2">🎉</span> Discord'a Katıl
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
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 md:mb-6 bg-gradient-to-r from-red-500 via-green-500 to-yellow-500 bg-clip-text text-transparent">
                  Maç Odaları
                </h2>
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
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 md:mb-6 bg-gradient-to-r from-red-500 via-green-500 to-yellow-500 bg-clip-text text-transparent">
                  Hazırlık Odaları
                </h2>
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
