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

  // Takım verilerini çek (puan durumu için)
  const { data: teams } = useQuery<any[]>({
    queryKey: ["/api/league/teams"],
  });

  const { data: leaderboard = [] } = useQuery<any[]>({
    queryKey: ["/api/league/stats/leaderboard"],
  });

  // Aralık 2 tarihinde oynanan maçları filtrele (hükmen olanlar hariç)
  const december2Matches = fixtures?.filter((fixture: any) => {
    if (!fixture.matchDate || fixture.isBye || fixture.isForfeit) return false;
    const matchDate = new Date(fixture.matchDate);
    // Aralık 2 tarihini kontrol et (yıl önemli değil, sadece ay ve gün)
    return matchDate.getMonth() === 11 && matchDate.getDate() === 2 && fixture.isPlayed;
  }) || [];

  // Bol gollü maçları bul (toplam 5 veya daha fazla gol)
  const highScoringMatches = december2Matches.filter((fixture: any) => {
    const totalGoals = (fixture.homeScore || 0) + (fixture.awayScore || 0);
    return totalGoals >= 5;
  });

  // Puan durumu lideri
  const leagueLeader = teams && teams.length > 0 ? teams[0] : null;

  // Gol lideri
  const goalLeader = leaderboard
    .filter((p: any) => p.totalGoals > 0)
    .sort((a: any, b: any) => b.totalGoals - a.totalGoals)[0] || null;
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
                    🏆 Lig Lideri Zirvede! Aralık 2'de Göz Alıcı Maçlar ve Gol Şovları
                  </h1>

                  {/* Spot */}
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                    <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Spot: {leagueLeader ? `${leagueLeader.name} ${leagueLeader.points} puanla ligde zirvede! ` : ''}Aralık 2'de oynanan maçlarda bol gollü karşılaşmalar yaşandı. {goalLeader ? `${goalLeader.username} ${goalLeader.totalGoals} golle gol krallığının lideri!` : ''}
                    </p>
                  </div>

                  {/* Maç Görseli */}
                  <div className="w-full h-64 md:h-96 bg-gradient-to-br from-blue-200 via-yellow-200 to-red-200 dark:from-blue-900 dark:via-yellow-900 dark:to-red-900 rounded-lg mb-4 overflow-hidden relative border-2 border-black/30 dark:border-amber-200/40">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-6xl md:text-8xl mb-4">🏆</div>
                        <p className="text-lg md:text-xl font-serif text-black/90 dark:text-amber-100/90 font-bold">
                          {leagueLeader ? `"${leagueLeader.name} Zirvede!"` : '"Lig Heyecanı Devam Ediyor"'}
                        </p>
                        <p className="text-sm md:text-base font-sans text-black/70 dark:text-amber-200/70 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {leagueLeader ? `${leagueLeader.points} puanla liderlik koltuğunda` : 'Aralık 2 maçlarından kareler'}
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                  <p className="text-xs md:text-sm text-black/60 dark:text-amber-200/60 font-serif mb-4">
                    Fotoğraf: HaxArena Arşivi - Aralık 2 Maçlarından Kareler
                  </p>

                  {/* Haber İçeriği */}
                  <div className="mb-6">
                    <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                      <span className="text-4xl md:text-5xl float-left mr-2 leading-none font-bold text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>L</span>
                      ig heyecanı tüm hızıyla devam ediyor! Puan durumunda {leagueLeader ? `${leagueLeader.name} takımı ${leagueLeader.points} puanla zirvede yer alırken` : 'şampiyonluk yarışı kızışıyor'}, Aralık 2 tarihinde oynanan maçlarda taraftarlar muhteşem anlara tanık oldu. {highScoringMatches.length > 0 ? `Özellikle bol gollü karşılaşmalar izleyenleri büyüledi. ` : ''}{goalLeader ? `${goalLeader.username} ise ${goalLeader.totalGoals} golle gol krallığının lideri olarak dikkat çekiyor.` : ''} Oyuncuların performansları takdir toplarken, ligdeki rekabet her geçen gün daha da çekişmeli hale geliyor.
                    </p>

                    {/* Puan Durumu ve Lider */}
                    {leagueLeader && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mt-4 mb-4">
                        <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          🏆 Lig Lideri: {leagueLeader.name}
                        </p>
                        <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {leagueLeader.name} takımı, {leagueLeader.points} puanla ligde zirvede yer alıyor. {leagueLeader.played} maçta {leagueLeader.won} galibiyet, {leagueLeader.drawn} beraberlik ve {leagueLeader.lost} mağlubiyet alan takım, {leagueLeader.goalsFor} gol atarken {leagueLeader.goalsAgainst} gol yedi. {leagueLeader.goalDifference > 0 ? `+${leagueLeader.goalDifference}` : leagueLeader.goalDifference} averajla takım, şampiyonluk yarışında en güçlü aday konumunda. Oyuncuların muhteşem performansları ve takım uyumu, {leagueLeader.name}'i ligde zirveye taşıyan en önemli faktörler.
                        </p>
                      </div>
                    )}

                    {/* Gol Lideri */}
                    {goalLeader && (
                      <div className="mb-6 border-b-2 border-black/20 dark:border-amber-200/20 pb-6">
                        <h2 className="text-xl md:text-2xl font-bold mb-3 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                          ⚽ Gol Lideri: {goalLeader.username}'in Muhteşem Performansı
                        </h2>
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {goalLeader.username}, {goalLeader.totalGoals} golle gol krallığının zirvesinde yer alıyor. {goalLeader.teamName ? `${goalLeader.teamName} takımının yıldız oyuncusu ` : 'Oyuncu '}sahadaki muhteşem performansıyla taraftarları büyülüyor. Gol atma yeteneği, top kontrolü ve sahadaki varlığıyla {goalLeader.username}, ligdeki en değerli oyuncular arasında gösteriliyor. Her maçta gösterdiği kararlılık ve yetenek, takımına büyük katkı sağlıyor.
                        </p>
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Taraftarlar ve uzmanlar, {goalLeader.username}'in bu sezon ligdeki en iyi performanslarından birini sergilediğini belirtiyor. Oyuncunun teknik direktörü de, {goalLeader.username}'in takımın en önemli oyuncularından biri olduğunu vurguluyor. Gol krallığı yarışında {goalLeader.username}'in bu formunu sürdürmesi bekleniyor.
                        </p>
                      </div>
                    )}

                    {/* Aralık 2 Maçları Analizi */}
                    {december2Matches.length > 0 && (
                      <div className="mb-6 border-b-2 border-black/20 dark:border-amber-200/20 pb-6">
                        <h2 className="text-xl md:text-2xl font-bold mb-3 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                          📅 Aralık 2 Maçları: Genel Analiz
                        </h2>
                        
                        <div className="space-y-4">
                          {december2Matches.map((match: any, index: number) => {
                            const totalGoals = (match.homeScore || 0) + (match.awayScore || 0);
                            const isHighScoring = totalGoals >= 5;
                            return (
                              <div key={match.id || index}>
                                <h3 className="text-lg md:text-xl font-semibold mb-2 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                                  {match.homeTeam?.name || 'Ev Sahibi'} {match.homeScore} - {match.awayScore} {match.awayTeam?.name || 'Deplasman'} {isHighScoring && <span className="text-red-600">⚽ Bol Gollü!</span>}
                                </h3>
                                <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                                  {isHighScoring ? `Bu maç, Aralık 2'nin en dikkat çeken karşılaşması oldu! ${totalGoals} gollü bu muhteşem maçta ` : 'Bu karşılaşmada '}{match.homeTeam?.name || 'Ev Sahibi'} ve {match.awayTeam?.name || 'Deplasman'} takımları karşı karşıya geldi. {match.homeScore > match.awayScore ? `${match.homeTeam?.name || 'Ev Sahibi'} takımı, ${match.homeScore} golle maçı kazanarak üstünlüğünü gösterdi.` : match.awayScore > match.homeScore ? `${match.awayTeam?.name || 'Deplasman'} takımı, deplasmanda ${match.awayScore} golle zafere ulaştı.` : `Maç ${match.homeScore}-${match.awayScore} berabere sonuçlandı.`} {isHighScoring ? `Her iki takımın oyuncuları da muhteşem performans sergiledi. Gol festivalleri taraftarları büyülerken, oyuncuların yetenekleri ön plana çıktı.` : 'İki takım da mücadeleci bir oyun sergiledi.'}
                                </p>
                                {match.goals && match.goals.length > 0 && (
                                  <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    Maçtaki golleri atan oyuncular: {match.goals.slice(0, 3).map((goal: any, gIdx: number) => goal.playerName || goal.player?.username || 'Bilinmeyen').join(', ')}{match.goals.length > 3 ? ` ve ${match.goals.length - 3} oyuncu daha.` : '.'}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Bol Gollü Maçlar Özel Bölümü */}
                    {highScoringMatches.length > 0 && (
                      <div className="mb-6 border-b-2 border-black/20 dark:border-amber-200/20 pb-6">
                        <h2 className="text-xl md:text-2xl font-bold mb-3 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                          ⚽ Bol Gollü Maçlar: Gol Şöleni!
                        </h2>
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Aralık 2'de oynanan maçlarda bol gollü karşılaşmalar taraftarları büyüledi! {highScoringMatches.length} maçta toplam {highScoringMatches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0)} gol atıldı. Bu maçlarda oyuncular muhteşem performanslar sergiledi ve sahadaki yeteneklerini konuşturdular.
                        </p>
                        <div className="space-y-3">
                          {highScoringMatches.map((match: any, index: number) => {
                            const totalGoals = (match.homeScore || 0) + (match.awayScore || 0);
                            return (
                              <div key={match.id || index} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3">
                                <p className="text-sm md:text-base font-bold text-black dark:text-amber-100 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                                  {match.homeTeam?.name || 'Ev Sahibi'} {match.homeScore} - {match.awayScore} {match.awayTeam?.name || 'Deplasman'} ({totalGoals} Gol!)
                                </p>
                                <p className="text-xs md:text-sm text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                                  {totalGoals >= 7 ? 'Maç, adeta bir gol şölenine dönüştü! ' : 'Bu maçta '}Her iki takımın oyuncuları da muhteşem goller attı ve taraftarlara unutulmaz anlar yaşattı. Oyuncuların performansları takdire şayan!
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}


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
