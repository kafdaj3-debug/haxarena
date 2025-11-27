import { useState } from "react";
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
      link: "https://www.haxball.com/play?c=_R4H-AKXKXs"
    },
    {
      matchName: "HaxArena Hazırlık Odası 2",
      link: "https://www.haxball.com/play?c=fadru3fscic"
    },
    {
      matchName: "HaxArena Hazırlık Odası 3",
      link: "https://www.haxball.com/play?c=iGpuVhRM4Uo"
    },
    {
      matchName: "HaxArena Hazırlık Odası 4",
      link: "https://www.haxball.com/play?c=BS2BiKgYAGI"
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

              {/* SAYFA 1 */}
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
                      Haftanın Komedisi
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                    🗞 HAFTANIN FUTBOL KOMEDİSİ: GOL YAĞMURU, DRAM, MUTSUZ YILDIZLAR VE BİR KOVA KALECİ!
                  </h1>
                  
                  {/* Vestel Manisaspor - Ravenclaw Haberi */}
                  <div className="border-t-2 border-black/20 dark:border-amber-200/20 pt-6 mt-6">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-black dark:text-amber-100 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      ⚡ Vestel Manisaspor <span className="font-bold">16</span> – <span className="font-bold">9</span> Ravenclaw: "<span className="font-bold">25</span> Gollü Maçta Defanslar Tatildeydi!"
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
                      <div className="space-y-4">
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Vestel Manisaspor resmen "Gol atıyorum, öyle böyle değil!" modunu açtı.
                        </p>
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Takımın gol makinelerinden MADRICHAA tam <span className="font-bold">5</span> gol atarken, Min-Jae ise <span className="font-bold">3</span> gol + <span className="font-bold">4</span> asistle adeta "Ben takımın her şeyi olurum!" dedi.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Ravenclaw tarafında ise işler hiç yolunda gitmiyor. <span className="font-bold">2</span> haftadır mağlubiyet…
                        </p>
                      </div>
                    </div>

                    {/* Alves Dramı Bölümü - Görsel ile */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border-2 border-black/30 dark:border-amber-200/30 mb-6">
                      <h3 className="text-xl md:text-2xl font-bold mb-4 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                        😢 Dramın başrolü: ALVES
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div className="space-y-3">
                          <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Alves oynamıyor…
                          </p>
                          <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Alves mutsuz…
                          </p>
                          <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Ravenclaw soyunma odası Alves'siz bomboş…
                          </p>
                          <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Tribünler Alves diye ağlıyor…
                          </p>
                          <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Top bile Alves'in yokluğunda sekmiyor…
                          </p>
                        </div>
                        <div className="flex items-center justify-center">
                          {/* Alves Meme Görseli */}
                          <div className="relative w-full max-w-md">
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40 rounded-lg p-2 border-2 border-amber-300 dark:border-amber-700 shadow-lg overflow-hidden">
                              {/* Meme görseli - önce dosyadan yüklemeyi dene, yoksa placeholder göster */}
                              <div className="relative">
                                <img 
                                  src="/alves-meme.png" 
                                  alt="Alves meme - alwés"
                                  className="w-full h-auto rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const placeholder = target.parentElement?.querySelector('.meme-placeholder') as HTMLElement;
                                    if (placeholder) placeholder.style.display = 'block';
                                  }}
                                />
                                {/* CSS ile oluşturulmuş meme placeholder */}
                                <div className="meme-placeholder hidden">
                                  {/* Üst kısım - adam */}
                                  <div className="relative h-48 bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900 dark:to-sky-800 rounded-t overflow-hidden mb-2">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="text-6xl">👤</div>
                                    </div>
                                  </div>
                                  {/* Alt kısım - yeşil arka plan ve X */}
                                  <div className="bg-green-600 dark:bg-green-800 rounded-b p-6 text-center">
                                    <div className="bg-white rounded-full w-24 h-24 mx-auto mb-3 flex items-center justify-center border-4 border-black shadow-lg">
                                      <span className="text-5xl font-black text-black">✗</span>
                                    </div>
                                    <p className="text-white text-xl font-bold tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>alwés</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4 mt-4">
                        <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          "Alves yokken hayatın ne anlamı var?" — Ravenclaw taraftarının ortak bildirisi
                        </p>
                      </div>
                      
                      <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 mt-4 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Sanki Alves değil, takımdan ayrılan sevgili gibi… Oyuncuların hepsi aynı cümleyi kuruyor: "Abi Alves dönsün, vallahi çok özledik…"
                      </p>
                      
                      <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 mt-2 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Ravenclaw'ın bu dramı Shakespeare'i bile kıskandırırdı.
                      </p>
                    </div>
                  </div>
                  
                  {/* Giresunspor Haberi */}
                  <div className="border-t-2 border-black/20 dark:border-amber-200/20 pt-6 mt-6">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-black dark:text-amber-100 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      🌲 Giresunspor <span className="font-bold">8</span> – <span className="font-bold">0</span> Umbra: "Giresunspor Şov, Umbra Küme Yolcusu!"
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-4">
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Giresunspor sahaya çıktı ve Umbra'yı görünce tek bir şey düşündü: "Bugün moral depolama günü."
                        </p>
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          <span className="font-bold">8</span> golle rakibini silindir gibi ezen Giresun'da
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4">
                          <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            💥 OSIMHEN resmen turbo modunda!
                          </p>
                          <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Savunmayı gördüğü an: "Aaa boşluk var!" deyip dalmış.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Umbra tarafında ise yıkım büyük… Özellikle kaptan Pasör…
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4">
                          <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Pasör mü? Pas mı? Pas geçiyor sadece.
                          </p>
                          <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                            "Kaptan neredesin?" — "Ben de bilmiyorum."
                          </p>
                        </div>
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Umbra'nın durumu açıklamak gerekirse: Geminin kaptanı Pasör ama gemi ters yönde yüzüyor…
                        </p>
                        <p className="text-base md:text-lg leading-relaxed text-black dark:text-amber-100 font-bold font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Küme düşme hattı: "Sizi bekliyoruz ♥"
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Brezilya Haberi */}
                  <div className="border-t-2 border-black/20 dark:border-amber-200/20 pt-6 mt-6">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-black dark:text-amber-100 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Brezilya <span className="font-bold">3</span> – <span className="font-bold">11</span> FK Bodø/Glimt: "Bodø Durmuyor, Oyunu Turbo Moduna Aldı!"
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-4">
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          FK Bodø/Glimt <span className="font-bold">2</span> haftadır resmen gol manyağı gibi takılıyor. Bu hafta da Brezilya'yı yakaladılar ve: "Pardon, geçiyoruz!" diyerek <span className="font-bold">11</span> gol bastılar.
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4">
                          <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            ⭐ Takımın yıldızı Oyassumi
                          </p>
                          <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                            <span className="font-bold">5</span> gol <span className="font-bold">5</span> asist… Adam tek başına Brezilya Milli Takımı'nı devirmiş gibi.
                          </p>
                        </div>
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Norveç ekibi öyle bir oynuyor ki, rakipler maç bitince eve yürüyerek gidiyor, düşünmek için.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4">
                          <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            🧤 Brezilya'nın kalecisi: "Eldiven mi? Eldiven değil, kova takmış."
                          </p>
                          <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Brezilya kalecisi için söylenecek tek şey: Kova Movaaa! Topu tutamadığı gibi top kendisini tutuyor. Golle burun buruna kaldı, o kadar.
                          </p>
                        </div>
                        <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Rakip futbolcular diyor ki: "Şut çekince gol olacağına o kadar emindik ki pas yerine şut attık."
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4 mt-4">
                          <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            ⚓ Bermudez'in liderliği?
                          </p>
                          <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Liderlik değil, yanlış yönlendirilmiş Google Maps gibi. Takım sağa dönecek diyor, sola gidiyorlar. Brezilya sahada resmen kayboldu.
                          </p>
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

              {/* SAYFA 2 - Cassé Haberi */}
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

                {/* Ana Başlık ve Görsel - Sayfa 2 */}
                <div className="relative mb-6">
                  <div className="mb-3">
                    <span className="inline-block bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                      Özel Haber
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                    📰 ŞOK ŞOK ŞOK! Ligin Gol Kralı Cassé Sırra Kadem Bastı!
                  </h1>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 text-black/90 dark:text-amber-100/90" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Los Infiernos'un yıldız futbolcusu Cassé, adeta "topu aldı, şehirden çıktı" diyerek ortadan kayboldu!
                  </h2>
                  <div className="w-full h-64 md:h-96 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-4 overflow-hidden relative border-2 border-black/30 dark:border-amber-200/40">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-6xl md:text-8xl mb-4">🔍</div>
                        <p className="text-lg md:text-xl font-serif text-black/90 dark:text-amber-100/90 font-bold">
                          "Nerede Olduğu Bilinmiyor!"
                        </p>
                        <p className="text-sm md:text-base font-sans text-black/70 dark:text-amber-200/70 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Los Infiernos taraftarları güne şokla uyandı
                        </p>
                      </div>
                    </div>
                    {/* Görsel üzerine overlay efekti */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                  <p className="text-xs md:text-sm text-black/60 dark:text-amber-200/60 font-serif mb-4">
                    Fotoğraf: Los Infiernos Kulübü - Cassé'nin Son Görüldüğü Yer
                  </p>
                </div>

                {/* İçerik Kolonları - Sayfa 2 */}
                <div className="relative mb-6">
                  <div className="mb-4 pb-2 border-b-2 border-black/30 dark:border-amber-200/30">
                    <h3 className="text-xl md:text-2xl font-bold text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Haberin Ayrıntıları:
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6">
                    <div className="space-y-4">
                      <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <span className="text-4xl md:text-5xl float-left mr-2 leading-none font-bold text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>L</span>
                        os Infiernos taraftarları güne şokla uyandı. Ligin gol kralı Cassé, dün akşam antrenmandan sonra "bir hava alıp geleceğim" diyerek tesislerden çıktı ve… bir daha dönmedi!
                      </p>
                      <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4 mt-4">
                        <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Nerede olduğu bilinmiyor:
                        </p>
                        <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Kulüp yetkilileri, Cassé'nin izini sürmek için GPS, drone ve mahalle bekçilerine kadar her kaynağı devreye soktu ama sonuç: koskoca bir hiç!
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4">
                        <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Telefonları açmıyor:
                        </p>
                        <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Menajeri, "Son aramamda çaldı, sonra bir daha çalmadı… muhtemelen şarjı bitti ya da beni görünce kapattı." diyerek durumu özetledi.
                        </p>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4 mt-4">
                        <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Taraftar panikte:
                        </p>
                        <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Sosyal medyada taraftarlar <span className="font-bold text-primary">#CasséNerede</span> etiketiyle kampanya başlattı. Bazı kullanıcılar oyuncunun Mars'a taşındığını, bazıları ise gizlice başka takımlarla görüşmeye gittiğini iddia ediyor.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alt Bölümler - Sayfa 2 */}
                <div className="relative border-t-2 border-black/20 dark:border-amber-200/20 pt-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 border-b border-black/20 dark:border-amber-200/20 pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Gol Krallığı
                      </h3>
                      {topScorers.length > 0 ? (
                        <p className="text-sm md:text-base font-serif text-black/80 dark:text-amber-200/80" style={{ fontFamily: "'Crimson Text', serif" }}>
                          Ligin gol kralı <span className="font-bold">{topScorers[0].username || 'Bilinmeyen'}</span> {topScorers[0].totalGoals || 0} gol ile zirvede yer alıyor. {topScorers[0].username || 'Bu oyuncu'} bu sezon gösterdiği performansla taraftarların dikkatini çekiyor ve ligdeki diğer oyuncular için zorlu bir rakip olmaya devam ediyor.
                        </p>
                      ) : (
                        <p className="text-sm md:text-base font-serif text-black/80 dark:text-amber-200/80" style={{ fontFamily: "'Crimson Text', serif" }}>
                          Ligin en golcü oyuncuları bu hafta da formlarını koruyor. Gol krallığı yarışı kızışmış durumda ve oyuncular arasındaki rekabet her geçen gün artıyor.
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 border-b border-black/20 dark:border-amber-200/20 pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Aktif Odalar
                      </h3>
                      <p className="text-sm md:text-base font-serif text-black/80 dark:text-amber-200/80" style={{ fontFamily: "'Crimson Text', serif" }}>
                        Günlük ortalama 50+ aktif oda ile topluluk, 7/24 kesintisiz maç imkanı sunuyor. Hazırlık odaları da yoğun ilgi görüyor.
                      </p>
                    </div>
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
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 md:mb-6 bg-gradient-to-r from-red-500 via-green-500 to-yellow-500 bg-clip-text text-transparent flex items-center gap-2">
                  <span className="text-2xl sparkle">⚽</span> Maç Odaları
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
