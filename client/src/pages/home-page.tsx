import { useState, useEffect } from "react";
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

  // Maçları bul - daha esnek eşleştirme
  const gebzeFearMatch = fixtures?.find((fixture: any) => {
    if (fixture.isBye) return false;
    const homeTeam = (fixture.homeTeam?.name || "").toLowerCase().trim();
    const awayTeam = (fixture.awayTeam?.name || "").toLowerCase().trim();
    const hasGebze = homeTeam.includes("gebze") || awayTeam.includes("gebze");
    const hasFear = homeTeam.includes("fear") || awayTeam.includes("fear") || 
                    homeTeam.includes("beard") || awayTeam.includes("beard");
    return hasGebze && hasFear;
  });

  const bodoTrebolMatch = fixtures?.find((fixture: any) => {
    if (fixture.isBye) return false;
    const homeTeam = (fixture.homeTeam?.name || "").toLowerCase().trim();
    const awayTeam = (fixture.awayTeam?.name || "").toLowerCase().trim();
    const hasBodo = homeTeam.includes("bod") || awayTeam.includes("bod") || 
                    homeTeam.includes("glimt") || awayTeam.includes("glimt");
    const hasTrebol = homeTeam.includes("trebol") || awayTeam.includes("trebol");
    return hasBodo && hasTrebol;
  });

  const ravenclawTurkishMatch = fixtures?.find((fixture: any) => {
    if (fixture.isBye) return false;
    const homeTeam = (fixture.homeTeam?.name || "").toLowerCase().trim();
    const awayTeam = (fixture.awayTeam?.name || "").toLowerCase().trim();
    const hasRavenclaw = homeTeam.includes("ravenclaw") || awayTeam.includes("ravenclaw") ||
                         homeTeam.includes("raven") || awayTeam.includes("raven");
    const hasTurkish = homeTeam.includes("turkish") || awayTeam.includes("turkish") ||
                       homeTeam.includes("union") || awayTeam.includes("union");
    return hasRavenclaw && hasTurkish;
  });
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
              
              {/* SAYFA 1 - Fear the Beard – Strasbourg */}
              {(
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

                {/* Ana Başlık - Sayfa 1 */}
                <div className="relative mb-6">
                  <div className="mb-3">
                    <span className="inline-block bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                      Özel Haber
                    </span>
                  </div>
                  
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                    ⚽ Dünün Maçları: Bodø Dominasyonu, Oyasumi Şovu ve Hakem Fırtınası
                  </h1>

                  {/* Spot */}
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                    <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Spot: Dün oynanan üç maçta Bodø/Glimt'in DM sıralamasında üç oyuncusu zirveye oturdu. Oyasumi performansıyla göz doldururken, hakemler taraftarların hedefi oldu.
                    </p>
                  </div>

                  {/* Maç Görseli */}
                  <div className="w-full h-64 md:h-96 bg-gradient-to-br from-blue-200 via-yellow-200 to-red-200 dark:from-blue-900 dark:via-yellow-900 dark:to-red-900 rounded-lg mb-4 overflow-hidden relative border-2 border-black/30 dark:border-amber-200/40">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-6xl md:text-8xl mb-4">⚽</div>
                        <p className="text-lg md:text-xl font-serif text-black/90 dark:text-amber-100/90 font-bold">
                          "Bodø Fırtınası Devam Ediyor"
                        </p>
                        <p className="text-sm md:text-base font-sans text-black/70 dark:text-amber-200/70 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                          DM sıralamasında üç oyuncuyla zirvede
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                  <p className="text-xs md:text-sm text-black/60 dark:text-amber-200/60 font-serif mb-4">
                    Fotoğraf: HaxArena Arşivi - Dünün Maçlarından Kareler
                  </p>

                  {/* Haber İçeriği */}
                  <div className="mb-6">
                    <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                      <span className="text-4xl md:text-5xl float-left mr-2 leading-none font-bold text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>D</span>
                      ün oynanan üç maç, ligde yeni bir sayfa açtı. Bodø/Glimt takımı, DM sıralamasında üç oyuncusuyla zirveye oturarak ligdeki gücünü bir kez daha gösterdi. Takımın oyuncuları, maçlarda gösterdikleri performansla taraftarların beğenisini kazandı.
                    </p>

                    {/* Bodø DM Sıralaması */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mt-4 mb-4">
                      <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Bodø/Glimt DM Sıralamasında Zirvede:
                      </p>
                      <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Dün oynanan maçlardan sonra DM sıralamasında Bodø/Glimt'in üç oyuncusu ilk sıralarda yer aldı. Takımın defansif gücü ve oyuncuların bireysel performansları, ligdeki diğer takımlar için ciddi bir tehdit oluşturuyor. Kulislerde Bodø/Glimt'in bu sezon şampiyonluk yarışında en güçlü aday olduğu konuşuluyor.
                      </p>
                    </div>

                    {/* Oyasumi Performansı */}
                    <div className="mb-6 border-b-2 border-black/20 dark:border-amber-200/20 pb-6">
                      <h2 className="text-xl md:text-2xl font-bold mb-3 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Oyasumi'nin Muhteşem Performansı
                      </h2>
                      <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Dün oynanan maçlarda Oyasumi, gösterdiği performansla taraftarları büyüledi. Oyuncu, sahadaki hareketleri ve top kontrolüyle takımına büyük katkı sağladı. Maç sonrası yapılan açıklamalarda teknik direktör, Oyasumi'nin bu sezon takımın en önemli oyuncularından biri olduğunu belirtti.
                      </p>
                      <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Taraftarlar ise Oyasumi'nin performansını sosyal medyada övgüyle karşıladı. Bazı taraftarlar, oyuncunun bu sezon ligdeki en iyi performanslarından birini sergilediğini söyledi.
                      </p>
                    </div>

                    {/* Dün Oynanan 3 Maç Analizi */}
                    <div className="mb-6 border-b-2 border-black/20 dark:border-amber-200/20 pb-6">
                      <h2 className="text-xl md:text-2xl font-bold mb-3 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Dünün Maçları: Genel Analiz
                      </h2>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold mb-2 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Maç 1: Bodø/Glimt vs Trebol FC
                          </h3>
                          <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Bu maçta Bodø/Glimt, taktiksel üstünlüğünü sahaya yansıttı. Trebol FC ise maç boyunca mücadele etse de, rakibinin gücü karşısında yetersiz kaldı. Maçın en dikkat çeken yanı, Bodø/Glimt oyuncularının defansif performansı oldu.
                          </p>
                          {bodoTrebolMatch?.goals && bodoTrebolMatch.goals.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm md:text-base font-semibold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Oyuncu Performansları:
                              </p>
                              {bodoTrebolMatch.goals.map((goal: any, idx: number) => {
                                const playerName = goal.player?.username || goal.playerName || "Bilinmeyen Oyuncu";
                                const assistName = goal.assistPlayer?.username || goal.assistPlayerName;
                                const performanceTexts = [
                                  `${playerName}, maçın kritik anlarında takımına liderlik etti ve sahadaki varlığıyla dikkat çekti.`,
                                  `${playerName}'ın top kontrolü ve pas kalitesi, takımının hücum oyununu belirleyen faktörlerden biri oldu.`,
                                  `${playerName}, defansif katkılarıyla takımının arkasında güçlü bir duvar oluşturdu.`,
                                  `${playerName}'ın hızı ve çevikliği, rakip takımın savunmasını sürekli zorladı.`,
                                  `${playerName}, maç boyunca gösterdiği kararlılık ve mücadele ruhuyla takımına ilham verdi.`,
                                  `${playerName}'ın teknik becerileri ve oyun zekası, maçın seyrini değiştiren unsurlardan biriydi.`
                                ];
                                const randomText = performanceTexts[idx % performanceTexts.length];
                                return (
                                  <p key={idx} className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {goal.isHomeGoal ? "Bodø/Glimt" : "Trebol FC"} tarafından {playerName} gol attı{assistName ? `, asist yapan ${assistName} oldu` : ""}. {randomText}
                                  </p>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg md:text-xl font-semibold mb-2 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Maç 2: Gebzespor vs Fear The Beard
                          </h3>
                          <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Dün oynanan bu karşılaşmada iki takım da dengeli bir oyun sergiledi. Maç, taraftarlar için heyecan verici anlar yaşattı. Her iki takımın da gol atma fırsatları oldu ancak sonuçlar beklenenin altında kaldı. Fear The Beard, maç boyunca taktik disiplinini korurken, Gebzespor ise mücadeleci bir performans sergiledi. Maçın en dikkat çeken yanı, her iki takımın da defansif organizasyonu oldu.
                          </p>
                          {gebzeFearMatch?.goals && gebzeFearMatch.goals.length > 0 && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-sm md:text-base font-semibold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Oyuncu Performansları:
                              </p>
                              {gebzeFearMatch.goals.map((goal: any, idx: number) => {
                                const playerName = goal.player?.username || goal.playerName || "Bilinmeyen Oyuncu";
                                const assistName = goal.assistPlayer?.username || goal.assistPlayerName;
                                const performanceTexts = [
                                  `${playerName}, maçın kritik anlarında takımına liderlik etti ve sahadaki varlığıyla dikkat çekti.`,
                                  `${playerName}'ın top kontrolü ve pas kalitesi, takımının hücum oyununu belirleyen faktörlerden biri oldu.`,
                                  `${playerName}, defansif katkılarıyla takımının arkasında güçlü bir duvar oluşturdu.`,
                                  `${playerName}'ın hızı ve çevikliği, rakip takımın savunmasını sürekli zorladı.`,
                                  `${playerName}, maç boyunca gösterdiği kararlılık ve mücadele ruhuyla takımına ilham verdi.`,
                                  `${playerName}'ın teknik becerileri ve oyun zekası, maçın seyrini değiştiren unsurlardan biriydi.`
                                ];
                                const randomText = performanceTexts[idx % performanceTexts.length];
                                return (
                                  <p key={idx} className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {goal.isHomeGoal ? "Gebzespor" : "Fear The Beard"} tarafından {playerName} gol attı{assistName ? `, asist yapan ${assistName} oldu` : ""}. {randomText}
                                  </p>
                                );
                              })}
                            </div>
                          )}
                          <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-2 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Maç sonrası yapılan açıklamalarda, her iki takımın teknik direktörü de oyuncularının performansından memnun kaldığını belirtti. Taraftarlar ise maçın kalitesinden övgüyle bahsetti. Ancak hakem kararları taraftarların eleştiri odağı oldu.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg md:text-xl font-semibold mb-2 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Maç 3: Ravenclaw vs Turkish Union
                          </h3>
                          <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Dün oynanan bu maçta Oyasumi'nin performansı öne çıktı. Oyuncu, sahadaki hareketleri ve top kontrolüyle takımına büyük katkı sağladı. Turkish Union ise maç boyunca mücadele etse de, rakibinin gücü karşısında zorlandı. Maçın en dikkat çeken yanı, Oyasumi'nin gösterdiği performans oldu. Oyuncu, maç boyunca takımına liderlik etti ve sahadaki varlığıyla dikkat çekti.
                          </p>
                          {ravenclawTurkishMatch?.goals && ravenclawTurkishMatch.goals.length > 0 && (
                            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <p className="text-sm md:text-base font-semibold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Oyuncu Performansları:
                              </p>
                              {ravenclawTurkishMatch.goals.map((goal: any, idx: number) => {
                                const playerName = goal.player?.username || goal.playerName || "Bilinmeyen Oyuncu";
                                const assistName = goal.assistPlayer?.username || goal.assistPlayerName;
                                const isOyasumi = playerName.toLowerCase().includes("oyasumi");
                                const oyasumiTexts = [
                                  `${playerName} maç boyunca muhteşem bir performans sergiledi, top kontrolü ve paslarıyla takımına liderlik etti.`,
                                  `${playerName}'ın oyun zekası ve teknik becerileri, maçın en dikkat çeken unsurlarından biriydi.`,
                                  `${playerName}, sahadaki her dokunuşunda kalite gösterdi ve takımının hücum oyununu şekillendirdi.`
                                ];
                                const regularTexts = [
                                  `${playerName}, maçın kritik anlarında takımına liderlik etti ve sahadaki varlığıyla dikkat çekti.`,
                                  `${playerName}'ın top kontrolü ve pas kalitesi, takımının hücum oyununu belirleyen faktörlerden biri oldu.`,
                                  `${playerName}, defansif katkılarıyla takımının arkasında güçlü bir duvar oluşturdu.`,
                                  `${playerName}'ın hızı ve çevikliği, rakip takımın savunmasını sürekli zorladı.`,
                                  `${playerName}, maç boyunca gösterdiği kararlılık ve mücadele ruhuyla takımına ilham verdi.`,
                                  `${playerName}'ın teknik becerileri ve oyun zekası, maçın seyrini değiştiren unsurlardan biriydi.`
                                ];
                                const performanceText = isOyasumi 
                                  ? oyasumiTexts[idx % oyasumiTexts.length]
                                  : regularTexts[idx % regularTexts.length];
                                return (
                                  <p key={idx} className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {goal.isHomeGoal ? "Ravenclaw" : "Turkish Union"} tarafından {playerName} gol attı{assistName ? `, asist yapan ${assistName} oldu` : ""}. {performanceText}
                                  </p>
                                );
                              })}
                            </div>
                          )}
                          <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-2 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Ravenclaw tarafında ise takım, Oyasumi'nin performansı sayesinde maçı kontrol altına aldı. Turkish Union ise maç boyunca mücadele etse de, rakibinin gücü karşısında yetersiz kaldı. Maç sonrası yapılan açıklamalarda, Oyasumi'nin performansı övgüyle karşılandı. Taraftarlar ise oyuncunun bu sezon ligdeki en iyi performanslarından birini sergilediğini söyledi.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Transfer Haberleri */}
                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mt-4 mb-4">
                      <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Transfer Pazarından Son Dakika:
                      </p>
                      <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Kulislerde dolaşan bilgilere göre, Bodø/Glimt yönetimi sezon sonunda takıma yeni oyuncular katmak için görüşmelere başladı. Ayrıca, Oyasumi'nin performansından etkilenen birkaç takımın, oyuncuyla ilgilendiği konuşuluyor. Transfer döneminde hangi oyuncuların hangi takımlara gideceği merakla bekleniyor.
                      </p>
                      <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Bir başka söylentiye göre, ligdeki bir takım, yurt dışından yıldız bir oyuncuyla anlaşma yapmak üzere. Detaylar henüz netleşmedi ancak transfer pazarının hareketli geçeceği kesin.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Twitter Benzeri Taraftar Yorumları */}
                <div className="mb-6 border-t-2 border-black/20 dark:border-amber-200/20 pt-6">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                    📱 Taraftarların Dünün Maçları Hakkında Yorumları
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Bodø/Glimt vs Trebol FC */}
                    <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">CY</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Can Yıldız</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@canyildiz_trebol</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 3dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            bu maçta rezalet olduk bodø/glimt bizi sike sike yendi takım oynayamıyor hiçbir şey yapamıyoruz amk takımı #TrebolFC
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 234</span>
                            <span>🔄 156</span>
                            <span>❤️ 345</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">EK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Emre Kaya</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@emrekaya_bodo</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 5dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            dün oynanan maçta takımımız gerçekten muhteşemdi bodø/glimt'in defansif gücü ve taktik disiplini harika üç oyuncumuz dm sıralamasında zirvede gurur duyuyoruz #BodøGlimt
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 456</span>
                            <span>🔄 234</span>
                            <span>❤️ 567</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">BK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Burak Koç</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@burakkoc_trebol</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 4dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            maçta 15 dakika oynadık sonra topu göremedik bodø/glimt oyuncuları topu bizden çaldı bizim oyuncular ne yapacağını bilmiyor amk #TrebolFC
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 189</span>
                            <span>🔄 134</span>
                            <span>❤️ 267</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gebzespor vs Fear The Beard */}
                    <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">SK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Serkan Kaya</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@serkankaya_gebze</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 4dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            bu maçta rezalet olduk fear the beard bizi sike sike yendi takım oynayamıyor hiçbir şey yapamıyoruz amk takımı #Gebzespor
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 189</span>
                            <span>🔄 134</span>
                            <span>❤️ 267</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">CA</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Can Arslan</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@canarslan_ftb</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 2dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            maçta 3 gol attık fear the beard gerçekten güçlü takım oyun tarzı çok iyi takım uyumu harika #FearTheBeard
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 234</span>
                            <span>🔄 123</span>
                            <span>❤️ 345</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">MK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Mehmet Korkmaz</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@mehmetkorkmaz_gebze</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 5dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            maçta 2 gol yedik gebzespor oyuncuları topu kontrol edemiyor fear the beard oyuncuları bizi geçti amk #Gebzespor
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 189</span>
                            <span>🔄 134</span>
                            <span>❤️ 267</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">AY</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Ayşe Yılmaz</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@ayseyilmaz_neutral</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 3dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            objektif bakarsak fear the beard formda gebzespor ise zorlanıyor maçın favorisi açık ama futbol bazen sürprizlerle dolu
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 156</span>
                            <span>🔄 78</span>
                            <span>❤️ 189</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ravenclaw vs Turkish Union */}
                    <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">EY</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Emre Yılmaz</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@emreyilmaz_raven</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 6dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            ravenclaw savunması rüzgâr esse dağılır amk takım oynayamıyor sike sike kaybediyoruz burak hakem de kesin hata yapacak #Ravenclaw
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 234</span>
                            <span>🔄 156</span>
                            <span>❤️ 345</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">AY</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Ayşe Yılmaz</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@ayseyilmaz_ravenclaw</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 2dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            oyasumi dün gerçekten harika oynadı top kontrolü pasları hareketleri mükemmeldi bu sezon ligdeki en iyi performanslarından biriydi tebrikler oyasumi #Ravenclaw
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 456</span>
                            <span>🔄 234</span>
                            <span>❤️ 567</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">CA</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Cem Arslan</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@cemarslan_tu</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 6dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            maçta oyasumi bizi geçti ravenclaw oyuncuları çok hızlı topu kontrol ediyorlar bizim oyuncular ne yapacağını bilmiyor amk #TurkishUnion
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 189</span>
                            <span>🔄 134</span>
                            <span>❤️ 267</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">MK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Murat Kaya</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@muratkaya_raven</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 8dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            maçta oyasumi 3 gol attı ravenclaw oyuncuları çok iyi oynadı turkish union oyuncuları topu kontrol edemiyor amk #Ravenclaw
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 234</span>
                            <span>🔄 156</span>
                            <span>❤️ 345</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">EK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Ege Kılıç</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@egekilic_neutral</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 4dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            objektif bakarsak her iki takım da zorlanıyor ravenclaw daha kötü durumda turkish union ise orta seviye maçın sonucu belirsiz ama her iki takım da zor bir sezon geçiriyor
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 178</span>
                            <span>🔄 89</span>
                            <span>❤️ 234</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hakem Yorumları */}
                    <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">FK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Fatih Kaya</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@fatihkaya_gebze</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 8dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            bu hakemlerin gözleri kör mü penaltı vermiyor faul çalmıyor siktirsin gitsinler sahadan amk hakemleri hiçbir şey bilmiyor #Gebzespor
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 567</span>
                            <span>🔄 345</span>
                            <span>❤️ 789</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">YK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Yusuf Koç</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@yusufkoc_ftb</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 9dk</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            hakem düdüğü eline aldı mı ne yapacağını bilmiyor bir penaltı veriyor sonra neden verdiğini unutuyor siktirsin gitsin bu hakem #FearTheBeard
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 678</span>
                            <span>🔄 456</span>
                            <span>❤️ 890</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alt Bilgi - Sayfa 1 */}

                {/* Alt Bilgi - Sayfa 1 */}
                <div className="relative border-t border-black/10 dark:border-amber-200/10 pt-4 mt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs md:text-sm font-mono text-black/50 dark:text-amber-200/50">
                    <div>HaxArena V6 Real Soccer</div>
                    <div>haxarena.web.tr</div>
                  </div>
                </div>
              </div>
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
