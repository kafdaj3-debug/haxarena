import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export default function NewspaperPage() {
  const { user, logout } = useAuth();

  // Takım verilerini çek (puan durumu için)
  const { data: teams, isLoading: teamsLoading } = useQuery<any[]>({
    queryKey: ["/api/league/teams"],
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
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
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              Gol Fırtınası, Mizah Dalgası!
            </h1>
          </div>

          {/* Haftanın Süperstarı: AEJEN */}
          <div className="mb-8">
            <Card className="border-2 border-black dark:border-amber-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="inline-block bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                    ⭐ Haftanın Süperstarı
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                  AEJEN – Holstein Kiel'in Yürüyen Çekici Kuvveti
                </h2>
                <div className="space-y-4">
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Holstein Kiel bu hafta da coştu, 4/4 yaparak resmen "Biz şampiyonluk trenini sürdürüyoruz, binmeyen koşsun" mesajı verdi.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Bu başarıyı kim sürüklüyor?
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Tabii ki sahada fizik kurallarını büküp rakip savunmayı mikrodalgada ısıtır gibi dağıtan Aején.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 mt-4">
                    <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      "Aején'i tutmak için üç kişiyi gönderdik, üçü de geri dönmedi."
                    </p>
                    <p className="text-sm text-black/70 dark:text-amber-200/70 italic">— Manifest'in analiz ekibi</p>
                  </div>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Holstein Kiel tarafında herkes keyifli, hatta kulübün sosyal medya yöneticisi bile "İki saatlik Aején highlights videosu hazırladım, paylaşmaya elim titriyor," dedi.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Los Infiernos */}
          <div className="mb-8">
            <Card className="border-2 border-black dark:border-amber-200 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="inline-block bg-red-500 dark:bg-red-600 text-white dark:text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                    🔥 Los Infiernos
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                  4/4 ve Alev Alev!
                </h2>
                <div className="space-y-4">
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Los Infiernos da haftayı 4/4 yaparak tamamladı.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Nasıl mı?
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                    "Rakip kim?" diye bakmadan her maç 8 soyma, 12 dilimleme modunda sahaya çıkarak.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Shamrock Rovers maçında 12 gol atarak öyle bir mesaj verdiler ki, rakip tribünleri maç sonunda "biz nereye geldik?" diye birbirine bakarken buldular.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shamrock Rovers */}
          <div className="mb-8">
            <Card className="border-2 border-black dark:border-amber-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="inline-block bg-gray-500 dark:bg-gray-600 text-white dark:text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                    😬 Shamrock Rovers
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Gelen Geçen Saldırıyor, Gol Atan Atana
                </h2>
                <div className="space-y-4">
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Shamrock Rovers'ın durumu gerçekten… hmmm…
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Hani bazı oyunlarda zorluk seviyesi yanlışlıkla "Acemi Bot"a alınır ya?
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                    İşte öyle.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Son haftalarda kim gelmişse gol atmış, kimi bulmuşsa vurmuş.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Bir ara rakip forvetlerin aralarında "kendi aramızda paylaşalım, ayıp olmasın şimdi" diye konuştuğu bile iddia edildi.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-500 dark:border-gray-400 p-4 mt-4">
                    <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      "Eldivenleri artık yıkamıyorum, yırtılıyor. Direkt yenisini alıyorum."
                    </p>
                    <p className="text-sm text-black/70 dark:text-amber-200/70 italic">— Shamrock'ın kalecisi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Antiran */}
          <div className="mb-8">
            <Card className="border-2 border-black dark:border-amber-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="inline-block bg-orange-500 dark:bg-orange-600 text-white dark:text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                    🐂⚔ ANTIRAN
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Haftanın Davet Edilmemiş Patronu
                </h2>
                <div className="space-y-4">
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Antiran tam bir gizli favori vibe'ı veriyor… ama artık gizli falan değiller: adamlar çok iyiler.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    FC Toros Bravos maçında 6 gol atıp "Biz buradayız kardeşim, hem de çok ciddiyiz" dediler.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Cristiano'nun 2 gol + 1 kendi kalesine gol karışık menülü performansı bile takımı yavaşlatamadı, kül yutmayan bir hücum merkezi var.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Retegui, Pablo Martín, Cristiano…
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Bu üçlü sahada öyle bir dolaşıyor ki, rakip savunma "ben bunu daha önce hesaplamamıştım" diye titreye titreye duruyor.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-orange-500 dark:border-orange-400 p-4 mt-4">
                    <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      "Takım bu formda giderse, sezon sonu kupa almaya değil, kupa seçmeye gideriz."
                    </p>
                    <p className="text-sm text-black/70 dark:text-amber-200/70 italic">— Teknik direktör</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Genel Durum */}
          <div className="mb-8">
            <Card className="border-2 border-black dark:border-amber-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="inline-block bg-blue-500 dark:bg-blue-600 text-white dark:text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                    🌪 Genel Durum
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Kısa Özet, Uzun Mizah
                </h2>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-green-500">
                    <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2">
                      Holstein Kiel → 4/4
                    </p>
                    <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80">
                      Rakipleri adeta "Sana gol göstereceğim" belgeseli izliyor.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-red-500">
                    <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2">
                      Los Infiernos → 4/4
                    </p>
                    <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80">
                      Gol atmak onlar için yürüyüş yapmak kadar doğal.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-gray-500">
                    <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2">
                      Shamrock Rovers → 0/sonsuz
                    </p>
                    <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80">
                      Rakip seçmiyorlar, herkese gol ikram ediyorlar.
                    </p>
                    <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 italic mt-2">
                      Savunma: "Bizim branş yanlış olabilir mi?"
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-orange-500">
                    <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2">
                      Antiran → tehlikeli derecede formda
                    </p>
                    <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80">
                      Hani biri gelir, kapıyı çalmaz, direkt içeri girer ya…
                    </p>
                    <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-bold mt-2">
                      İşte Antiran o takım.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Puan Durumu Görseli */}
          <div className="mb-8">
            <Card className="border-2 border-black dark:border-amber-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-center text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Puan Durumu
                </h3>
                {teamsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                ) : !teams?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Henüz takım bulunmamaktadır
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-black dark:border-amber-200">
                          <th className="text-left p-3 font-semibold text-black dark:text-amber-100">#</th>
                          <th className="text-left p-3 font-semibold text-black dark:text-amber-100">Takım</th>
                          <th className="text-center p-3 font-semibold text-black dark:text-amber-100">O</th>
                          <th className="text-center p-3 font-semibold text-black dark:text-amber-100">G</th>
                          <th className="text-center p-3 font-semibold text-black dark:text-amber-100">B</th>
                          <th className="text-center p-3 font-semibold text-black dark:text-amber-100">M</th>
                          <th className="text-center p-3 font-semibold text-black dark:text-amber-100">A</th>
                          <th className="text-center p-3 font-semibold text-black dark:text-amber-100">Y</th>
                          <th className="text-center p-3 font-semibold text-black dark:text-amber-100">AV</th>
                          <th className="text-center p-3 font-semibold text-black dark:text-amber-100">P</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams?.map((team, index) => {
                          const position = index + 1;
                          const isChampionsLeague = position <= 4;
                          const isPlayOff = position >= 5 && position <= 12;
                          const isEuropaLeague = position >= 13 && position <= 16;
                          const isRelegation = position >= 17 && position <= 21;
                          
                          let rowClass = "hover:bg-muted/50";
                          
                          if (isChampionsLeague) {
                            rowClass = "bg-gradient-to-r from-blue-600/20 to-blue-700/10 border-l-4 border-blue-600";
                          } else if (isPlayOff) {
                            rowClass = "bg-gradient-to-r from-blue-400/15 to-blue-500/8 border-l-4 border-blue-400";
                          } else if (isEuropaLeague) {
                            rowClass = "bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-l-4 border-orange-500";
                          } else if (isRelegation) {
                            rowClass = "bg-gradient-to-r from-red-700/20 to-red-800/10 border-l-4 border-red-700";
                          }
                          
                          return (
                            <tr 
                              key={team.id} 
                              className={`border-b transition-colors ${rowClass}`}
                            >
                              <td className="p-3 font-bold text-black dark:text-amber-100">{position}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  {team.logo && (
                                    <img 
                                      src={team.logo} 
                                      alt={team.name} 
                                      className="w-8 h-8 object-contain"
                                    />
                                  )}
                                  <span className="font-medium text-black dark:text-amber-100">{team.name}</span>
                                </div>
                              </td>
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.played || 0}</td>
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.won || 0}</td>
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.drawn || 0}</td>
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.lost || 0}</td>
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.goalsFor || 0}</td>
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.goalsAgainst || 0}</td>
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.goalDifference || 0}</td>
                              <td className="p-3 text-center font-bold text-black dark:text-amber-100">{team.points || 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}

