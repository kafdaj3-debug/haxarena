import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActiveRoomCard from "@/components/ActiveRoomCard";
import ForumPostCard from "@/components/ForumPostCard";
import LiveChat from "@/components/LiveChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Trophy, MessageSquare, Shield, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function HomePage() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
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
              
              {/* Sayfa Geçiş Kontrolü */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="hover-elevate active-elevate-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Önceki
                </Button>
                <div className="text-sm md:text-base font-mono text-black/70 dark:text-amber-200/70 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
                  {currentPage}/2
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(2)}
                  disabled={currentPage === 2}
                  className="hover-elevate active-elevate-2"
                >
                  Sonraki
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* SAYFA 1 - Fear the Beard – Strasbourg */}
              {currentPage === 1 && (
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
                    📰 Fear the Beard – Strasbourg Karşılaşmasına "Zorunlu Mola" Damgası
                  </h1>

                  {/* Haber İçeriği */}
                  <div className="mb-6">
                    <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                      <span className="text-4xl md:text-5xl float-left mr-2 leading-none font-bold text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>D</span>
                      ün oynanan Fear the Beard – Strasbourg karşılaşması, skorundan çok… duraklamalarıyla gündeme oturdu. Mücadele zaman zaman öyle uzun aralar verdi ki, tribündeki bazı taraftarlar "Devre arası bitti mi, yoksa hâlâ moladayız?" diye birbirine sormaya başladı.
                    </p>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-orange-500 p-4 mt-4 mb-4">
                      <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Kulislerde Dolaşan Bilgiler:
                      </p>
                      <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Kulislerde dolaşan bilgilere göre Strasbourg cephesinde maç günü bir "mide problemi" krizi yaşandı. Oyuncuların büyük bir kısmının, maç öncesi yedikleri şeye fazla güvenmiş olabileceği konuşuluyor. Bazılarına göre takım otobüsünde başlayan hareketlilik, sahada da devam etti. Hatta bir ara yedek kulübesinde "sıraya girenler" olduğu esprisi bile yayılmış durumda.
                      </p>
                    </div>

                    <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Fear the Beard tarafı ise bu beklenmedik molaları şaşkınlıkla izlerken, bazı oyuncuların duraklamaları fırsat bilip kenarda mini bir taktik sohbeti yaptığı görüldü. Maçın hakemi de sık sık "Devam ediyor muyuz?" bakışı atmak zorunda kaldı.
                    </p>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mt-4 mb-4">
                      <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Sosyal Medya Yorumu:
                      </p>
                      <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                        "Maçın adamı: Tuvalet kapısı."
                      </p>
                    </div>

                    <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-4 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Strasbourg cephesi resmi bir açıklama yapmadı ama takımın bir dahaki maç için "daha hafif bir menü" planladığı konuşuluyor.
                    </p>
                  </div>
                </div>

                {/* Twitter Benzeri Taraftar Yorumları */}
                <div className="mb-6 border-t-2 border-black/20 dark:border-amber-200/20 pt-6">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                    📱 Taraftarlar Ne Diyor?
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Tweet 1 */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">MA</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Mehmet Avcı</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@mehmetavci_ftb</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 2s</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            Formayı çıkarın siktirin gidin! Böyle maç mı olur? Her saniye tuvalet molası veriyorsunuz!
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 12</span>
                            <span>🔄 8</span>
                            <span>❤️ 45</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tweet 2 */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">AK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Ali Kaya</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@alikaya_beard</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 15s</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            Bu maçı izlemek yerine tuvalet kuyruğunda beklemek daha eğlenceliydi. Strasbourg takımına önerim: Bir dahaki sefere maçtan önce yemek yemeyin!
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 23</span>
                            <span>🔄 15</span>
                            <span>❤️ 67</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tweet 3 */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">CY</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Can Yılmaz</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@canyilmaz_ftb</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 23s</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            Maçın en iyi oyuncusu tuvalet kapısı oldu. MVP ödülünü ona verelim! 😂😂😂
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 89</span>
                            <span>🔄 34</span>
                            <span>❤️ 156</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tweet 4 */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">ÖD</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Özkan Demir</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@ozkandemir_ftb</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 31s</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            Strasbourg takımı maçtan önce ne yedi acaba? Ben de yiyeyim, belki ben de profesyonel futbolcu olurum! 😂
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 45</span>
                            <span>🔄 28</span>
                            <span>❤️ 98</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tweet 5 */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">BK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black dark:text-amber-100">Burak Koç</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">@burakkoc_ftb</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">· 42s</span>
                          </div>
                          <p className="text-sm text-black/90 dark:text-amber-100/90 mb-2">
                            Hakem maçı durdurdu mu yoksa Strasbourg oyuncuları mı? Artık anlayamıyoruz! Formayı çıkarın, tuvalet takımı kurun!
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 67</span>
                            <span>🔄 42</span>
                            <span>❤️ 123</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alt Bilgi - Sayfa 1 */}
                <div className="relative border-t border-black/10 dark:border-amber-200/10 pt-4 mt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs md:text-sm font-mono text-black/50 dark:text-amber-200/50">
                    <div>Sayfa 1 | HaxArena V6 Real Soccer</div>
                    <div>haxarena.web.tr</div>
                  </div>
                </div>
              </div>
              )}

              {/* SAYFA 2 - Kulislerde Hareketlilik */}
              {currentPage === 2 && (
              <div className="relative bg-gradient-to-br from-amber-50 via-amber-50/95 to-amber-100/90 dark:from-amber-900/30 dark:via-amber-900/20 dark:to-amber-800/30 border-4 border-amber-800/30 dark:border-amber-700/40 shadow-2xl p-6 md:p-10 lg:p-12 transform rotate-0 hover:rotate-0 transition-all duration-300">
                {/* Eski kağıt dokusu efekti */}
                <div className="absolute inset-0 opacity-10 dark:opacity-5" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundSize: '200px 200px'
                }}></div>
                
                {/* Gazete Başlığı - Sayfa 2 */}
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

                {/* Ana Başlık - Sayfa 2 */}
                <div className="relative mb-6">
                  <div className="mb-3">
                    <span className="inline-block bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                      Özel Haber
                    </span>
                  </div>
                  
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                    📰 Kulislerde Hareketlilik: Yeni Takımın Oyuncu Görüşmeleri Sızdı
                  </h1>

                  {/* Haber İçeriği */}
                  <div className="mb-6">
                    <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                      <span className="text-4xl md:text-5xl float-left mr-2 leading-none font-bold text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>L</span>
                      ig kulislerinde dikkat çeken yeni bir gelişme yaşandı. Henüz resmi olarak duyurulmayan yeni bir takımın, kadro kurma sürecinde mevcut ekiplerle temasa geçtiğine dair bilgiler spor camiasına sızdı. Gelen söylentilere göre yeni oluşum, birkaç tecrübeli oyuncuyu renklerine bağlamak için görüşmeler yürütüyor.
                    </p>
                    
                    <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Sızan bilgilere göre, kulislerde konuşulan isimler arasında Ravenclaw ekibinden de bazı oyuncuların geçtiği fısıldanıyor. Ancak bu temasların ne aşamada olduğu veya hangi oyuncuların değerlendirildiği konusunda net bir bilgi bulunmuyor. Aynı şekilde farklı takımlardan da alternatif isimlerin listeye alındığı ifade ediliyor.
                    </p>

                    <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500 p-4 mt-4 mb-4">
                      <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Kulis Söylentileri:
                      </p>
                      <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Yeni takımın, başvuru dosyasını güçlendirmek adına kadro yapılanmasını hızlandırdığı ve yakın zamanda daha somut adımlar atabileceği konuşuluyor. Buna rağmen ekipten resmi bir açıklama gelmediği için sürecin nasıl ilerleyeceği merak konusu olmaya devam ediyor.
                      </p>
                    </div>

                    <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans mb-4 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Kulislerde dolaşan bilgiler doğrulandıkça ve yeni bilgiler ortaya çıktıkça gelişmeleri aktarmayı sürdüreceğiz.
                    </p>
                  </div>
                </div>

                {/* Alt Bilgi - Sayfa 2 */}
                <div className="relative border-t border-black/10 dark:border-amber-200/10 pt-4 mt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs md:text-sm font-mono text-black/50 dark:text-amber-200/50">
                    <div>Sayfa 2 | HaxArena V6 Real Soccer</div>
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
