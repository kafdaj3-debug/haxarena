import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { buildApiUrl } from "@/lib/queryClient";

export default function NewspaperPage() {
  const { user, logout } = useAuth();

  // Fikstür verilerini çek
  const { data: fixtures, isLoading: fixturesLoading } = useQuery<any[]>({
    queryKey: ["/api/league/fixtures"],
  });

  // Takım verilerini çek (puan durumu için)
  const { data: teams, isLoading: teamsLoading } = useQuery<any[]>({
    queryKey: ["/api/league/teams"],
  });

  // Trebol FC vs Gebzespor maçını bul
  const trebolGebzeMatch = fixtures?.find((fixture: any) => {
    const homeTeam = fixture.homeTeam?.name?.toLowerCase() || "";
    const awayTeam = fixture.awayTeam?.name?.toLowerCase() || "";
    return (
      (homeTeam.includes("trebol") && awayTeam.includes("gebze")) ||
      (homeTeam.includes("gebze") && awayTeam.includes("trebol"))
    );
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
              HAXARENA GAZETESİ
            </h2>
            <div className="text-center text-xs md:text-sm mt-2 text-black/60 dark:text-amber-200/60 font-serif italic">
              Türkiye'nin En Büyük HaxBall Real Soccer Haber Kaynağı
            </div>
          </div>

          {/* Spot */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
            <p className="text-lg md:text-xl font-bold text-black dark:text-amber-100 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              Spot: Haftalardır sosyal medyada "atışma ligi" kuran Trebol FC ile Gebzespor, sonunda sahada karşılaştı. Sonuç? Klavyede başlayan rekabet sahada farklı bitti…
            </p>
          </div>

          {/* Ana Başlık */}
          <div className="mb-6">
            <div className="mb-3">
              <span className="inline-block bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase">
                Özel Haber
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              Klavyede Başlayan Rekabet Sahada Farklı Bitti!
            </h1>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 text-black/90 dark:text-amber-100/90" style={{ fontFamily: "'Playfair Display', serif" }}>
              Trebol FC 8 – 0 Gebzespor: Sosyal Medya Atışmaları Sahada Sonuç Vermedi
            </h2>
          </div>

          {/* Maç Skoru Görseli */}
          <div className="mb-8">
            <Card className="border-2 border-black dark:border-amber-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Maç Sonucu
                </h3>
                <div className="flex items-center justify-center gap-6 md:gap-12">
                  {/* Ev Sahibi Takım */}
                  <div className="flex flex-col items-center gap-3 flex-1">
                    {trebolGebzeMatch?.homeTeam?.logo ? (
                      <img 
                        src={trebolGebzeMatch.homeTeam.logo} 
                        alt={trebolGebzeMatch.homeTeam.name} 
                        className="w-20 h-20 md:w-24 md:h-24 object-contain"
                      />
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚽</span>
                      </div>
                    )}
                    <span className="font-bold text-lg md:text-xl text-center text-black dark:text-amber-100">
                      {trebolGebzeMatch?.homeTeam?.name || "Trebol FC"}
                    </span>
                  </div>

                  {/* Skor */}
                  <div className="flex items-center gap-4">
                    <div className="text-5xl md:text-7xl font-bold text-green-600 dark:text-green-400">
                      {trebolGebzeMatch?.homeScore ?? 8}
                    </div>
                    <div className="text-3xl md:text-5xl font-bold text-black dark:text-amber-100">
                      -
                    </div>
                    <div className="text-5xl md:text-7xl font-bold text-red-600 dark:text-red-400">
                      {trebolGebzeMatch?.awayScore ?? 0}
                    </div>
                  </div>

                  {/* Deplasman Takımı */}
                  <div className="flex flex-col items-center gap-3 flex-1">
                    {trebolGebzeMatch?.awayTeam?.logo ? (
                      <img 
                        src={trebolGebzeMatch.awayTeam.logo} 
                        alt={trebolGebzeMatch.awayTeam.name} 
                        className="w-20 h-20 md:w-24 md:h-24 object-contain"
                      />
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚽</span>
                      </div>
                    )}
                    <span className="font-bold text-lg md:text-xl text-center text-black dark:text-amber-100">
                      {trebolGebzeMatch?.awayTeam?.name || "Gebzespor"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* İçerik Kolonları */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-4">
                <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span className="text-4xl md:text-5xl float-left mr-2 leading-none font-bold text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>L</span>
                  igin başından beri sosyal medyada "tatlı sert" göndermeleriyle gündeme oturan Trebol FC ile Gebzespor, haftanın merakla beklenen maçında karşı karşıya geldi. Ancak karşılaşma, skor tabelasında pek de "tatlı" durmadı: Trebol FC 8 – 0 Gebzespor!
                </p>
                <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Maç sonrası Trebol cephesi kutlama yaparken, sosyal medyada iddialı açıklamalarıyla bilinen Gebzespor kaptanı, mağlubiyeti şöyle değerlendirdi:
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4 mt-4">
                  <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    "Bir kişi eksiktik, yenmek kolay tabii."
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Bu açıklama sonrası Trebol taraftarları sosyal medyayı salladı. En çok beğeni alan yorumlardan bazıları şöyle:
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4">
                  <ul className="space-y-2 text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <li>• "Biz de gol atarken bir kişi eksiktik, kaleciyi kullanmadık zaten."</li>
                    <li>• "Hocamız devre arasında bir kişiyi daha eksiltelim diye düşündü ama ayıp olur dedik."</li>
                    <li>• "Biz de 8 gol atarken hep bir kişi fazlaydık: Motivasyon!"</li>
                  </ul>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-amber-200 p-4 mt-4">
                  <p className="text-base md:text-lg font-bold text-black dark:text-amber-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Trebol FC teknik ekibi:
                  </p>
                  <p className="text-sm md:text-base text-black/80 dark:text-amber-200/80 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    "Sosyal medyada çok koştular, sahada biraz yorulmuş olabilirler."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gebzespor Taraftarları Yorumu */}
          <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 border-l-4 border-orange-500">
            <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
              Gebzespor taraftarları ise sonuçtan memnun olmasa da takımlarının arkasında durmaya devam ediyor. Ancak camianın ortak görüşü şu şekilde özetlenebilir:
            </p>
            <p className="text-lg md:text-xl font-bold text-black dark:text-amber-100 mt-3 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              "Bir sonraki maç tam kadro geliyoruz. Tam kadro gelince 8 olmaz… 7 olur, 6 olur. O kadar da değil."
            </p>
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
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.matchesPlayed || 0}</td>
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.wins || 0}</td>
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.draws || 0}</td>
                              <td className="p-3 text-center text-black dark:text-amber-100">{team.losses || 0}</td>
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

          {/* Yorum Bölümü */}
          <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-600">
            <h3 className="text-2xl font-bold mb-4 text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              Editör Yorumu
            </h3>
            <div className="space-y-4">
              <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span className="text-4xl md:text-5xl float-left mr-2 leading-none font-bold text-black dark:text-amber-100" style={{ fontFamily: "'Playfair Display', serif" }}>S</span>
                osyal medya çağında futbol, artık sadece sahada oynanmıyor. Trebol FC ile Gebzespor arasındaki bu maç, dijital dünyada başlayan rekabetin gerçek sahaya nasıl yansıdığının en net örneği oldu.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                Klavyede cesur olmak kolay, ancak sahada performans göstermek bambaşka bir şey. Trebol FC, sosyal medyadaki iddialarını sahada kanıtladı. 8-0'lık skor, sadece bir sayı değil, aynı zamanda hazırlığın, takım ruhunun ve motivasyonun ne kadar önemli olduğunun göstergesi.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                Gebzespor'un "bir kişi eksiktik" açıklaması, mağlubiyeti kabul etmek yerine bahaneler üretmek olarak yorumlanabilir. Ancak taraftarlarının takımlarının arkasında durması, gerçek bir camia ruhunu gösteriyor. Bir sonraki maçta tam kadro gelmeleri durumunda farklı bir sonuç görebiliriz.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-black/90 dark:text-amber-100/90 font-sans font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                Sonuç olarak, bu maç bize şunu gösterdi: Sosyal medyada atışmak eğlenceli olabilir, ancak gerçek başarı sahada kazanılır. Trebol FC bunu kanıtladı, Gebzespor ise bir sonraki maçta kendini kanıtlama şansı bulacak.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-blue-300 dark:border-blue-600">
              <p className="text-sm text-black/70 dark:text-amber-200/70 font-serif italic">
                — HaxArena Gazetesi Editörü
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

