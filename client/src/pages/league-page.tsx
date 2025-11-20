import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Trophy, Award, Users, Crown, Medal, Sparkles, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";

export default function LeaguePage() {
  const { user, logout, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [selectedTotwWeek, setSelectedTotwWeek] = useState("");
  const [activeTab, setActiveTab] = useState("standings");

  // Giriş yapmamış kullanıcıları giriş sayfasına yönlendir
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/giris");
    }
  }, [user, isLoading, navigate]);

  // URL parametresinden tab değerini oku
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  const { data: teams, isLoading: teamsLoading } = useQuery<any[]>({
    queryKey: ["/api/league/teams"],
  });

  const { data: fixtures, isLoading: fixturesLoading } = useQuery<any[]>({
    queryKey: ["/api/league/fixtures"],
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<any[]>({
    queryKey: ["/api/league/stats/leaderboard"],
  });

  const { data: teamsOfWeek } = useQuery<any[]>({
    queryKey: ["/api/league/team-of-week"],
  });

  const { data: selectedTotw } = useQuery<any>({
    queryKey: ["/api/league/team-of-week", selectedTotwWeek],
    queryFn: async () => {
      if (!selectedTotwWeek) return null;
      const res = await fetch(`/api/league/team-of-week/${selectedTotwWeek}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedTotwWeek,
  });

  // Group fixtures by week and sort by date
  const fixturesByWeek = fixtures?.reduce((acc, fixture) => {
    if (!acc[fixture.week]) {
      acc[fixture.week] = [];
    }
    acc[fixture.week].push(fixture);
    return acc;
  }, {} as Record<number, any[]>) || {};

  // Sort fixtures within each week by match date and time (earliest first - ascending order)
  Object.keys(fixturesByWeek).forEach(week => {
    fixturesByWeek[parseInt(week)].sort((a: any, b: any) => {
      // Parse dates properly, handling timezone
      const dateA = a.matchDate ? new Date(a.matchDate).getTime() : 0;
      const dateB = b.matchDate ? new Date(b.matchDate).getTime() : 0;
      
      // If dates are equal, maintain original order or sort by team name
      if (dateA === dateB) {
        // If same date, sort by home team name for consistency
        const nameA = a.homeTeam?.name || '';
        const nameB = b.homeTeam?.name || '';
        return nameA.localeCompare(nameB, 'tr');
      }
      
      // Earliest date first (ascending order: 4 Ocak before 5 Ocak)
      return dateA - dateB;
    });
  });

  // Sort weeks by week number (ascending: 1, 2, 3... 11)
  const weeks = Object.keys(fixturesByWeek).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  // Get current week's matches (this week)
  const getCurrentWeekMatches = () => {
    if (!fixtures) return [];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    return fixtures.filter((fixture: any) => {
      const matchDate = new Date(fixture.matchDate);
      return matchDate >= startOfWeek && matchDate <= endOfWeek;
    }).sort((a: any, b: any) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  };

  const currentWeekMatches = getCurrentWeekMatches();


  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  // Block render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-4" data-testid="text-page-title">
              Lig
            </h1>
            <p className="text-muted-foreground">HaxArena Ligi puan durumu ve fikstür bilgileri</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="border rounded-lg p-2 bg-muted/30">
              <TabsList className="w-full h-auto flex flex-wrap gap-2 bg-transparent">
                <TabsTrigger value="standings" data-testid="tab-standings" className="flex-1 min-w-[140px]">
                  📈 Puan Durumu
                </TabsTrigger>
                <TabsTrigger value="fixtures" data-testid="tab-fixtures" className="flex-1 min-w-[140px]">
                  🗓️ Fikstür
                </TabsTrigger>
                <TabsTrigger value="totw" data-testid="tab-totw" className="flex-1 min-w-[140px]">
                  🏟️ Haftanın Kadrosu
                </TabsTrigger>
                <TabsTrigger value="goals" data-testid="tab-goals" className="flex-1 min-w-[140px]">
                  <span className="mr-1">⚽</span> Gol Krallığı
                </TabsTrigger>
                <TabsTrigger value="assists" data-testid="tab-assists" className="flex-1 min-w-[140px]">
                  <span className="mr-1">🎯</span> Asist Krallığı
                </TabsTrigger>
                <TabsTrigger value="dm" data-testid="tab-dm" className="flex-1 min-w-[100px]">
                  <span className="mr-1">🛡️</span> DM
                </TabsTrigger>
                <TabsTrigger value="cs" data-testid="tab-cs" className="flex-1 min-w-[100px]">
                  <span className="mr-1">🥅</span> CS
                </TabsTrigger>
                <TabsTrigger value="saves" data-testid="tab-saves" className="flex-1 min-w-[140px]">
                  <span className="mr-1">🧤</span> Kurtarış
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="standings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Puan Durumu</CardTitle>
                </CardHeader>
                <CardContent>
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
                          <tr className="border-b">
                            <th className="text-left p-3 font-semibold">#</th>
                            <th className="text-left p-3 font-semibold">Takım</th>
                            <th className="text-center p-3 font-semibold">O</th>
                            <th className="text-center p-3 font-semibold">G</th>
                            <th className="text-center p-3 font-semibold">B</th>
                            <th className="text-center p-3 font-semibold">M</th>
                            <th className="text-center p-3 font-semibold">A</th>
                            <th className="text-center p-3 font-semibold">Y</th>
                            <th className="text-center p-3 font-semibold">AV</th>
                            <th className="text-center p-3 font-semibold">İA</th>
                            <th className="text-center p-3 font-semibold">P</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teams?.map((team, index) => {
                            const position = index + 1;
                            // Şampiyonlar Ligi: 1-4 (doğrudan çeyrek final)
                            const isChampionsLeague = position <= 4;
                            // Play-Off: 5-12 (kazananlar çeyrek finale çıkar) - Turuncu
                            const isPlayOff = position >= 5 && position <= 12;
                            // Avrupa Ligi: 13-16 (doğrudan Avrupa Ligi çeyrek final) - Yeşil
                            const isEuropaLeague = position >= 13 && position <= 16;
                            // Küme: 17-21 - Koyu kırmızı
                            const isRelegation = position >= 17 && position <= 21;
                            
                            // Renklendirme
                            let rowClass = "hover:bg-muted/50";
                            let badgeElement = null;
                            
                            if (isChampionsLeague) {
                              rowClass = "bg-gradient-to-r from-blue-600/20 to-blue-700/10 border-l-4 border-blue-600 hover:opacity-90";
                              badgeElement = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-700 border border-blue-600/50">
                                  <span className="text-blue-600 font-bold">🏆</span>
                                  <span>Şampiyonlar Ligi</span>
                                </span>
                              );
                            } else if (isPlayOff) {
                              // Açık mavi (1-4'ün daha açığı)
                              rowClass = "bg-gradient-to-r from-blue-400/15 to-blue-500/8 border-l-4 border-blue-400 hover:opacity-90";
                              badgeElement = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-700 border border-blue-400/50">
                                  <span className="text-blue-500 font-bold">⚔️</span>
                                  <span>Play-Off</span>
                                </span>
                              );
                            } else if (isEuropaLeague) {
                              rowClass = "bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-l-4 border-orange-500 hover:opacity-90";
                              badgeElement = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-700 border border-orange-500/50">
                                  <span className="text-orange-600 font-bold">🌍</span>
                                  <span>Avrupa Ligi</span>
                                </span>
                              );
                            } else if (isRelegation) {
                              rowClass = "bg-gradient-to-r from-red-700/20 to-red-800/10 border-l-4 border-red-700 hover:opacity-90";
                              badgeElement = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-700/20 text-red-800 border border-red-700/50">
                                  <span className="text-red-700 font-bold">⬇️</span>
                                  <span>Küme</span>
                                </span>
                              );
                            }
                            
                            return (
                            <tr 
                              key={team.id} 
                              className={`border-b transition-colors ${rowClass}`}
                              data-testid={`row-team-${team.id}`}
                            >
                              <td className="p-3 font-bold text-center">
                                {position}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  {team.logo && (
                                    <img 
                                      src={team.logo} 
                                      alt={team.name} 
                                      className="w-10 h-10 object-contain"
                                    />
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium">{team.name}</span>
                                    {badgeElement}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">{team.played}</td>
                              <td className="p-3 text-center">{team.won}</td>
                              <td className="p-3 text-center">{team.drawn}</td>
                              <td className="p-3 text-center">{team.lost}</td>
                              <td className="p-3 text-center">{team.goalsFor}</td>
                              <td className="p-3 text-center">{team.goalsAgainst}</td>
                              <td className="p-3 text-center font-medium">
                                <span className={team.goalDifference > 0 ? "text-green-600" : team.goalDifference < 0 ? "text-red-600" : ""}>
                                  {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                                </span>
                              </td>
                              <td className="p-3 text-center font-medium">
                                <span className={team.headToHead > 0 ? "text-green-600" : team.headToHead < 0 ? "text-red-600" : ""}>
                                  {team.headToHead > 0 ? "+" : ""}{team.headToHead || 0}
                                </span>
                              </td>
                              <td className={`p-3 text-center font-bold ${
                                isChampionsLeague ? "text-blue-600 text-lg" : 
                                isPlayOff ? "text-blue-400" : 
                                isEuropaLeague ? "text-orange-600" : 
                                isRelegation ? "text-red-700" :
                                "text-primary"
                              }`}>
                                {team.points}
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg space-y-3">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>O:</strong> Oynanan, <strong>G:</strong> Galibiyet, <strong>B:</strong> Beraberlik, <strong>M:</strong> Mağlubiyet</p>
                      <p><strong>A:</strong> Atılan Gol, <strong>Y:</strong> Yenilen Gol, <strong>AV:</strong> Averaj, <strong>İA:</strong> İkili Averaj, <strong>P:</strong> Puan</p>
                    </div>
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-700 border border-blue-600/50">
                          <span className="text-blue-600 font-bold">🏆</span>
                          <span>Şampiyonlar Ligi</span>
                        </span>
                        <span className="text-muted-foreground">1-4. sıradaki takımlar doğrudan çeyrek finale yükselir</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-700 border border-blue-400/50">
                          <span className="text-blue-500 font-bold">⚔️</span>
                          <span>Play-Off</span>
                        </span>
                        <span className="text-muted-foreground">5-12. sıradaki takımlar Play-Off oynar; kazananlar çeyrek finale çıkar</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-700 border border-orange-500/50">
                          <span className="text-orange-600 font-bold">🌍</span>
                          <span>Avrupa Ligi</span>
                        </span>
                        <span className="text-muted-foreground">13-16. sıradaki takımlar doğrudan Avrupa Ligi Çeyrek Finaline katılır</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-700/20 text-red-800 border border-red-700/50">
                          <span className="text-red-700 font-bold">⬇️</span>
                          <span>Küme</span>
                        </span>
                        <span className="text-muted-foreground">17-21. sıradaki takımlar küme düşer</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 italic">
                        Not: Play-Off'ta elenen 4 takım Avrupa Ligi Çeyrek Finalisti olur
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fixtures" className="space-y-6">
              {fixturesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
              ) : !fixtures?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz maç bulunmamaktadır
                </div>
              ) : (
                <>
                  {/* Bu Haftaki Maçlar - Özel Bölüm */}
                  {currentWeekMatches.length > 0 && (
                    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <Calendar className="w-6 h-6 text-primary" />
                          Bu Haftaki Maçlar
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Bu hafta oynanacak tüm maçlar ve detayları
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {currentWeekMatches.map((fixture: any) => {
                          // Ensure matchDate is always available, even after score update
                          const matchDate = fixture.matchDate ? new Date(fixture.matchDate) : new Date();
                          const isToday = matchDate.toDateString() === new Date().toDateString();
                          const isPast = matchDate < new Date();
                          const isBye = fixture.isBye;
                          const isPostponed = fixture.isPostponed;
                          
                          return (
                            <div 
                              key={fixture.id} 
                              className={`p-5 border-2 rounded-xl transition-all hover:shadow-lg ${
                                isBye
                                  ? "border-blue-500/30 bg-blue-500/10"
                                  : isPostponed
                                  ? "border-orange-500/30 bg-orange-500/10"
                                  : isToday 
                                  ? "border-primary bg-primary/10 shadow-md" 
                                  : isPast
                                  ? "border-muted bg-muted/30"
                                  : "border-border bg-card hover:border-primary/50"
                              }`}
                              data-testid={`fixture-current-week-${fixture.id}`}
                            >
                              <div className="flex items-center justify-between gap-4 mb-3">
                                <div className="flex items-center gap-4 flex-1">
                                  {isBye && fixture.byeSide === "home" ? (
                                    <div className="w-14 h-14 flex items-center justify-center bg-blue-500/20 rounded-lg border-2 border-blue-500/50">
                                      <span className="font-bold text-blue-600 text-lg">BAY</span>
                                    </div>
                                  ) : fixture.homeTeam?.logo ? (
                                    <img 
                                      src={fixture.homeTeam.logo} 
                                      alt={fixture.homeTeam.name} 
                                      className="w-14 h-14 object-contain"
                                    />
                                  ) : null}
                                  <div className="flex-1 text-right">
                                    {isBye && fixture.byeSide === "home" ? (
                                      <span className="font-bold text-lg text-blue-600">BAY</span>
                                    ) : (
                                      <span className={`font-bold text-lg ${fixture.isPlayed && fixture.homeScore > fixture.awayScore ? "text-green-600" : ""}`}>
                                        {fixture.homeTeam?.name || "BAY"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center min-w-[120px]">
                                  {isBye ? (
                                    <div className="text-2xl font-bold text-blue-600 bg-blue-500/20 px-4 py-2 rounded-lg border-2 border-blue-500/50">
                                      BAY GEÇME
                                    </div>
                                  ) : fixture.isPlayed ? (
                                    <div className="text-3xl font-bold flex items-center gap-2">
                                      <span className={fixture.homeScore > fixture.awayScore ? "text-green-600" : fixture.homeScore < fixture.awayScore ? "text-muted-foreground" : "text-blue-600"}>
                                        {fixture.homeScore}
                                      </span>
                                      <span className="text-muted-foreground">-</span>
                                      <span className={fixture.awayScore > fixture.homeScore ? "text-green-600" : fixture.awayScore < fixture.homeScore ? "text-muted-foreground" : "text-blue-600"}>
                                        {fixture.awayScore}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xl font-bold text-muted-foreground">VS</span>
                                  )}
                                  {isToday && !fixture.isPlayed && !isBye && (
                                    <span className="text-xs font-semibold text-primary mt-1 bg-primary/20 px-2 py-1 rounded-full">
                                      BUGÜN
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex-1">
                                    {isBye && fixture.byeSide === "away" ? (
                                      <span className="font-bold text-lg text-blue-600">BAY</span>
                                    ) : (
                                      <span className={`font-bold text-lg ${fixture.isPlayed && fixture.awayScore > fixture.homeScore ? "text-green-600" : ""}`}>
                                        {fixture.awayTeam?.name || "BAY"}
                                      </span>
                                    )}
                                  </div>
                                  {isBye && fixture.byeSide === "away" ? (
                                    <div className="w-14 h-14 flex items-center justify-center bg-blue-500/20 rounded-lg border-2 border-blue-500/50">
                                      <span className="font-bold text-blue-600 text-lg">BAY</span>
                                    </div>
                                  ) : fixture.awayTeam?.logo ? (
                                    <img 
                                      src={fixture.awayTeam.logo} 
                                      alt={fixture.awayTeam.name} 
                                      className="w-14 h-14 object-contain"
                                    />
                                  ) : null}
                                </div>
                              </div>
                              
                              {/* Gol/Asist Bilgileri */}
                              {fixture.goals && fixture.goals.length > 0 && (
                                <div className="mt-4 pt-3 border-t">
                                  <h4 className="text-sm font-semibold mb-2">Gol Detayları:</h4>
                                  <div className="space-y-1">
                                    {fixture.goals
                                      .sort((a: any, b: any) => a.minute - b.minute)
                                      .map((goal: any, idx: number) => {
                                        // Format minute: saniye -> dakika.saniye veya sadece saniye
                                        const formatMinute = (seconds: number): string => {
                                          if (seconds === 0) return "0";
                                          const minutes = Math.floor(seconds / 60);
                                          const secs = seconds % 60;
                                          if (minutes > 0 && secs > 0) {
                                            return `${minutes}.${String(secs).padStart(2, '0')}'`;
                                          } else if (minutes > 0) {
                                            return `${minutes}'`;
                                          } else {
                                            return `${secs}''`;
                                          }
                                        };
                                        return (
                                          <div key={idx} className="text-xs flex items-center gap-2">
                                            <span className="font-medium">{formatMinute(goal.minute)}</span>
                                            <span>{goal.playerName || goal.player?.username || "Bilinmeyen"}</span>
                                            {(goal.assistPlayerName || goal.assistPlayer) && (
                                              <span className="text-muted-foreground">
                                                (Asist: {goal.assistPlayerName || goal.assistPlayer?.username || "Bilinmeyen"})
                                              </span>
                                            )}
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${goal.isHomeTeam ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                                              {goal.isHomeTeam ? fixture.homeTeam?.name : fixture.awayTeam?.name}
                                            </span>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between pt-3 border-t">
                                <div className="flex-1"></div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {matchDate.toLocaleString('tr-TR', {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      timeZone: 'Europe/Istanbul'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isPostponed && (
                                    <span className="text-xs font-semibold text-orange-600 bg-orange-600/20 px-2 py-1 rounded-full">
                                      ERTELENDİ
                                    </span>
                                  )}
                                  {fixture.isPlayed && !isPostponed && (
                                    <span className="text-xs font-semibold text-green-600 bg-green-600/20 px-2 py-1 rounded-full">
                                      OYNANDI
                                    </span>
                                  )}
                                  {fixture.matchRecordingUrl && (
                                    <a
                                      href={fixture.matchRecordingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-semibold text-blue-600 bg-blue-600/20 px-2 py-1 rounded-full hover:bg-blue-600/30 transition-colors"
                                    >
                                      📹 Maç Kaydı
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {/* Tüm Haftalar */}
                  {weeks.map((week) => (
                  <Card key={week}>
                    <CardHeader>
                      <CardTitle>{week}. Hafta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {fixturesByWeek[parseInt(week)].map((fixture: any) => {
                        const isBye = fixture.isBye;
                        const isPostponed = fixture.isPostponed;
                        return (
                        <div 
                          key={fixture.id} 
                          className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                            isBye ? "border-blue-500/30 bg-blue-500/10" : 
                            isPostponed ? "border-orange-500/30 bg-orange-500/10" : ""
                          }`}
                          data-testid={`fixture-${fixture.id}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {isBye && fixture.byeSide === "home" ? (
                                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded border border-blue-500/50 flex-shrink-0">
                                  <span className="font-bold text-blue-600 text-xs">BAY</span>
                                </div>
                              ) : fixture.homeTeam?.logo ? (
                                <img 
                                  src={fixture.homeTeam.logo} 
                                  alt={fixture.homeTeam.name} 
                                  className="w-10 h-10 object-contain flex-shrink-0"
                                />
                              ) : null}
                              <span className="font-medium text-left truncate">
                                {isBye && fixture.byeSide === "home" ? (
                                  <span className="text-blue-600 font-bold">BAY</span>
                                ) : (
                                  fixture.homeTeam?.name || "BAY"
                                )}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-center min-w-[100px] flex-shrink-0">
                              {isBye ? (
                                <span className="text-blue-600 font-bold text-sm bg-blue-500/20 px-3 py-1 rounded border border-blue-500/50 whitespace-nowrap">BAY GEÇME</span>
                              ) : fixture.isPlayed ? (
                                <div className="text-2xl font-bold flex items-center gap-2">
                                  <span className={fixture.homeScore > fixture.awayScore ? "text-green-600" : fixture.homeScore < fixture.awayScore ? "text-muted-foreground" : ""}>
                                    {fixture.homeScore}
                                  </span>
                                  <span className="text-muted-foreground">-</span>
                                  <span className={fixture.awayScore > fixture.homeScore ? "text-green-600" : fixture.awayScore < fixture.homeScore ? "text-muted-foreground" : ""}>
                                    {fixture.awayScore}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground font-medium whitespace-nowrap">VS</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                              <span className="font-medium text-right truncate">
                                {isBye && fixture.byeSide === "away" ? (
                                  <span className="text-blue-600 font-bold">BAY</span>
                                ) : (
                                  fixture.awayTeam?.name || "BAY"
                                )}
                              </span>
                              {isBye && fixture.byeSide === "away" ? (
                                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded border border-blue-500/50 flex-shrink-0">
                                  <span className="font-bold text-blue-600 text-xs">BAY</span>
                                </div>
                              ) : fixture.awayTeam?.logo ? (
                                <img 
                                  src={fixture.awayTeam.logo} 
                                  alt={fixture.awayTeam.name} 
                                  className="w-10 h-10 object-contain flex-shrink-0"
                                />
                              ) : null}
                            </div>
                          </div>
                          {!isBye && (
                            <div className="mt-3 pt-3 border-t space-y-2">
                              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(fixture.matchDate).toLocaleString('tr-TR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Europe/Istanbul'
                                })}</span>
                              </div>
                              {isPostponed && (
                                <div className="flex justify-center">
                                  <span className="text-xs font-semibold text-orange-600 bg-orange-600/20 px-2 py-1 rounded-full">
                                    ERTELENDİ
                                  </span>
                                </div>
                              )}
                              {fixture.matchRecordingUrl && (
                                <div className="flex justify-center">
                                  <a
                                    href={fixture.matchRecordingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-semibold text-blue-600 bg-blue-600/20 px-2 py-1 rounded-full hover:bg-blue-600/30 transition-colors"
                                  >
                                    📹 Maç Kaydı
                                  </a>
                                </div>
                              )}
                              {fixture.goals && fixture.goals.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                  <h5 className="text-xs font-semibold mb-1 text-center">Gol Detayları:</h5>
                                  <div className="space-y-0.5">
                                    {fixture.goals
                                      .sort((a: any, b: any) => a.minute - b.minute)
                                      .map((goal: any, idx: number) => {
                                        // Format minute: saniye -> dakika.saniye veya sadece saniye
                                        const formatMinute = (seconds: number): string => {
                                          if (seconds === 0) return "0";
                                          const minutes = Math.floor(seconds / 60);
                                          const secs = seconds % 60;
                                          if (minutes > 0 && secs > 0) {
                                            return `${minutes}.${String(secs).padStart(2, '0')}'`;
                                          } else if (minutes > 0) {
                                            return `${minutes}'`;
                                          } else {
                                            return `${secs}''`;
                                          }
                                        };
                                        return (
                                          <div key={idx} className="text-xs text-center">
                                            <span className="font-medium">{formatMinute(goal.minute)}</span>
                                            <span> {goal.playerName || goal.player?.username || "Bilinmeyen"}</span>
                                            {(goal.assistPlayerName || goal.assistPlayer) && (
                                              <span className="text-muted-foreground">
                                                {" "}(Asist: {goal.assistPlayerName || goal.assistPlayer?.username || "Bilinmeyen"})
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
                </>
              )}
            </TabsContent>

            {/* ⚽ Gol Krallığı */}
            <TabsContent value="goals" className="space-y-4">
              {leaderboardLoading ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">Yükleniyor...</div>
                  </CardContent>
                </Card>
              ) : !leaderboard?.length ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">Henüz gol atan yok</div>
                  </CardContent>
                </Card>
              ) : (() => {
                const sortedPlayers = leaderboard
                  .filter((p: any) => p.totalGoals > 0)
                  .sort((a: any, b: any) => b.totalGoals - a.totalGoals)
                  .slice(0, 10);
                
                if (sortedPlayers.length === 0) {
                  return (
                    <Card>
                      <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">Henüz gol atan yok</p>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* 1st Place - Special Card */}
                    {sortedPlayers[0] && (
                      <Card className="overflow-hidden border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-yellow-900/20 shadow-xl">
                        <div className="relative p-6 md:p-8">
                          <Sparkles className="absolute top-4 right-4 w-8 h-8 text-yellow-500/30 animate-pulse" />
                          <Star className="absolute top-6 right-8 w-4 h-4 text-yellow-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                          
                          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="relative flex-shrink-0">
                              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg ring-4 ring-yellow-300/50">
                                <Crown className="w-12 h-12 md:w-16 md:h-16 text-yellow-900" />
                              </div>
                              <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                                1
                              </div>
                            </div>
                            
                            <div className="flex-1 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <Trophy className="w-6 h-6 text-yellow-600" />
                                <h3 className="text-2xl md:text-3xl font-bold text-yellow-900 dark:text-yellow-400">
                                  Gol Kralı
                                </h3>
                              </div>
                              <Link 
                                href={`/oyuncu/${sortedPlayers[0].username}`}
                                className="block group"
                              >
                                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 group-hover:text-yellow-600 transition-colors">
                                  {sortedPlayers[0].username}
                                </h2>
                              </Link>
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                                <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-2">
                                  <div className="text-xs text-muted-foreground mb-1">Gol</div>
                                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                                    {sortedPlayers[0].totalGoals}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* 2nd and 3rd Place */}
                    {(sortedPlayers[1] || sortedPlayers[2]) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedPlayers[1] && (
                          <Card className="overflow-hidden border-2 border-gray-300/50 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900/30 dark:via-slate-900/30 dark:to-gray-800/30 shadow-lg">
                            <div className="relative p-5">
                              <Medal className="absolute top-3 right-3 w-6 h-6 text-gray-400/30" />
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-slate-400 flex items-center justify-center shadow-md ring-2 ring-gray-200/50">
                                    <Medal className="w-8 h-8 text-gray-700" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow">
                                    2
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link 
                                    href={`/oyuncu/${sortedPlayers[1].username}`}
                                    className="block group"
                                  >
                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-gray-600 transition-colors truncate">
                                      {sortedPlayers[1].username}
                                    </h3>
                                  </Link>
                                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                    {sortedPlayers[1].totalGoals} Gol
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}

                        {sortedPlayers[2] && (
                          <Card className="overflow-hidden border-2 border-amber-700/50 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-900/20 shadow-lg">
                            <div className="relative p-5">
                              <Medal className="absolute top-3 right-3 w-6 h-6 text-amber-600/30" />
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-md ring-2 ring-amber-500/50">
                                    <Medal className="w-8 h-8 text-amber-100" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 bg-amber-700 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow">
                                    3
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link 
                                    href={`/oyuncu/${sortedPlayers[2].username}`}
                                    className="block group"
                                  >
                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-amber-700 transition-colors truncate">
                                      {sortedPlayers[2].username}
                                    </h3>
                                  </Link>
                                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                    {sortedPlayers[2].totalGoals} Gol
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Rest of the players */}
                    {sortedPlayers.length > 3 && (
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span>⚽</span> Diğer Sıralamalar
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {sortedPlayers.slice(3).map((player: any, index: number) => (
                              <div 
                                key={player.userId} 
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-muted-foreground w-6">
                                    {index + 4}
                                  </span>
                                  <Link 
                                    href={`/oyuncu/${player.username}`}
                                    className="font-medium hover:text-primary transition-colors"
                                  >
                                    {player.username}
                                  </Link>
                                </div>
                                <span className="font-bold text-primary">{player.totalGoals} Gol</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            {/* 🎯 Asist Krallığı */}
            <TabsContent value="assists" className="space-y-4">
              {leaderboardLoading ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">Yükleniyor...</div>
                  </CardContent>
                </Card>
              ) : !leaderboard?.length ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">Henüz asist yapan yok</div>
                  </CardContent>
                </Card>
              ) : (() => {
                const sortedPlayers = leaderboard
                  .filter((p: any) => p.totalAssists > 0)
                  .sort((a: any, b: any) => b.totalAssists - a.totalAssists)
                  .slice(0, 10);
                
                if (sortedPlayers.length === 0) {
                  return (
                    <Card>
                      <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">Henüz asist yapan yok</p>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <div className="space-y-6">
                    {sortedPlayers[0] && (
                      <Card className="overflow-hidden border-2 border-blue-400/50 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-blue-900/20 shadow-xl">
                        <div className="relative p-6 md:p-8">
                          <Sparkles className="absolute top-4 right-4 w-8 h-8 text-blue-500/30 animate-pulse" />
                          <Star className="absolute top-6 right-8 w-4 h-4 text-blue-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="relative flex-shrink-0">
                              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg ring-4 ring-blue-300/50">
                                <Crown className="w-12 h-12 md:w-16 md:h-16 text-blue-900" />
                              </div>
                              <div className="absolute -top-2 -right-2 bg-blue-500 text-blue-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                                1
                              </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <Trophy className="w-6 h-6 text-blue-600" />
                                <h3 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-400">
                                  Asist Kralı
                                </h3>
                              </div>
                              <Link href={`/oyuncu/${sortedPlayers[0].username}`} className="block group">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
                                  {sortedPlayers[0].username}
                                </h2>
                              </Link>
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                                <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-2">
                                  <div className="text-xs text-muted-foreground mb-1">Asist</div>
                                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                    {sortedPlayers[0].totalAssists}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                    {(sortedPlayers[1] || sortedPlayers[2]) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedPlayers[1] && (
                          <Card className="overflow-hidden border-2 border-gray-300/50 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900/30 dark:via-slate-900/30 dark:to-gray-800/30 shadow-lg">
                            <div className="relative p-5">
                              <Medal className="absolute top-3 right-3 w-6 h-6 text-gray-400/30" />
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-slate-400 flex items-center justify-center shadow-md ring-2 ring-gray-200/50">
                                    <Medal className="w-8 h-8 text-gray-700" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow">
                                    2
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/oyuncu/${sortedPlayers[1].username}`} className="block group">
                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-gray-600 transition-colors truncate">
                                      {sortedPlayers[1].username}
                                    </h3>
                                  </Link>
                                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                    {sortedPlayers[1].totalAssists} Asist
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                        {sortedPlayers[2] && (
                          <Card className="overflow-hidden border-2 border-amber-700/50 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-900/20 shadow-lg">
                            <div className="relative p-5">
                              <Medal className="absolute top-3 right-3 w-6 h-6 text-amber-600/30" />
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-md ring-2 ring-amber-500/50">
                                    <Medal className="w-8 h-8 text-amber-100" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 bg-amber-700 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow">
                                    3
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/oyuncu/${sortedPlayers[2].username}`} className="block group">
                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-amber-700 transition-colors truncate">
                                      {sortedPlayers[2].username}
                                    </h3>
                                  </Link>
                                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                    {sortedPlayers[2].totalAssists} Asist
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}
                    {sortedPlayers.length > 3 && (
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span>🎯</span> Diğer Sıralamalar
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {sortedPlayers.slice(3).map((player: any, index: number) => (
                              <div key={player.userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-muted-foreground w-6">{index + 4}</span>
                                  <Link href={`/oyuncu/${player.username}`} className="font-medium hover:text-primary transition-colors">
                                    {player.username}
                                  </Link>
                                </div>
                                <span className="font-bold text-blue-600">{player.totalAssists} Asist</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            {/* 🧤 En Çok Kurtarış */}
            <TabsContent value="saves" className="space-y-4">
              {leaderboardLoading ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">Yükleniyor...</div>
                  </CardContent>
                </Card>
              ) : !leaderboard?.length ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">Henüz kurtarış yapan yok</div>
                  </CardContent>
                </Card>
              ) : (() => {
                const sortedPlayers = leaderboard
                  .filter((p: any) => p.totalSaves > 0)
                  .sort((a: any, b: any) => b.totalSaves - a.totalSaves)
                  .slice(0, 10);
                
                if (sortedPlayers.length === 0) {
                  return (
                    <Card>
                      <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">Henüz kurtarış yapan yok</p>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <div className="space-y-6">
                    {sortedPlayers[0] && (
                      <Card className="overflow-hidden border-2 border-green-400/50 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-green-900/20 shadow-xl">
                        <div className="relative p-6 md:p-8">
                          <Sparkles className="absolute top-4 right-4 w-8 h-8 text-green-500/30 animate-pulse" />
                          <Star className="absolute top-6 right-8 w-4 h-4 text-green-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="relative flex-shrink-0">
                              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg ring-4 ring-green-300/50">
                                <Crown className="w-12 h-12 md:w-16 md:h-16 text-green-900" />
                              </div>
                              <div className="absolute -top-2 -right-2 bg-green-500 text-green-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                                1
                              </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <Trophy className="w-6 h-6 text-green-600" />
                                <h3 className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-400">
                                  Kurtarış Kralı
                                </h3>
                              </div>
                              <Link href={`/oyuncu/${sortedPlayers[0].username}`} className="block group">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 group-hover:text-green-600 transition-colors">
                                  {sortedPlayers[0].username}
                                </h2>
                              </Link>
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                                <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-2">
                                  <div className="text-xs text-muted-foreground mb-1">Kurtarış</div>
                                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                    {sortedPlayers[0].totalSaves}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                    {(sortedPlayers[1] || sortedPlayers[2]) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedPlayers[1] && (
                          <Card className="overflow-hidden border-2 border-gray-300/50 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900/30 dark:via-slate-900/30 dark:to-gray-800/30 shadow-lg">
                            <div className="relative p-5">
                              <Medal className="absolute top-3 right-3 w-6 h-6 text-gray-400/30" />
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-slate-400 flex items-center justify-center shadow-md ring-2 ring-gray-200/50">
                                    <Medal className="w-8 h-8 text-gray-700" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow">
                                    2
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/oyuncu/${sortedPlayers[1].username}`} className="block group">
                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-gray-600 transition-colors truncate">
                                      {sortedPlayers[1].username}
                                    </h3>
                                  </Link>
                                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                    {sortedPlayers[1].totalSaves} Kurtarış
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                        {sortedPlayers[2] && (
                          <Card className="overflow-hidden border-2 border-amber-700/50 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-900/20 shadow-lg">
                            <div className="relative p-5">
                              <Medal className="absolute top-3 right-3 w-6 h-6 text-amber-600/30" />
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-md ring-2 ring-amber-500/50">
                                    <Medal className="w-8 h-8 text-amber-100" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 bg-amber-700 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow">
                                    3
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/oyuncu/${sortedPlayers[2].username}`} className="block group">
                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-amber-700 transition-colors truncate">
                                      {sortedPlayers[2].username}
                                    </h3>
                                  </Link>
                                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                    {sortedPlayers[2].totalSaves} Kurtarış
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}
                    {sortedPlayers.length > 3 && (
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span>🧤</span> Diğer Sıralamalar
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {sortedPlayers.slice(3).map((player: any, index: number) => (
                              <div key={player.userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-muted-foreground w-6">{index + 4}</span>
                                  <Link href={`/oyuncu/${player.username}`} className="font-medium hover:text-primary transition-colors">
                                    {player.username}
                                  </Link>
                                </div>
                                <span className="font-bold text-green-600">{player.totalSaves} Kurtarış</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            {/* 🛡️ DM */}
            <TabsContent value="dm" className="space-y-4">
              {leaderboardLoading ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">Yükleniyor...</div>
                  </CardContent>
                </Card>
              ) : !leaderboard?.length ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">Henüz DM yok</div>
                  </CardContent>
                </Card>
              ) : (() => {
                const sortedPlayers = leaderboard
                  .filter((p: any) => p.totalDm > 0)
                  .sort((a: any, b: any) => b.totalDm - a.totalDm)
                  .slice(0, 10);
                
                if (sortedPlayers.length === 0) {
                  return (
                    <Card>
                      <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">Henüz DM yok</p>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <div className="space-y-6">
                    {sortedPlayers[0] && (
                      <Card className="overflow-hidden border-2 border-red-400/50 bg-gradient-to-br from-red-50 via-rose-50 to-red-100 dark:from-red-950/20 dark:via-rose-950/20 dark:to-red-900/20 shadow-xl">
                        <div className="relative p-6 md:p-8">
                          <Sparkles className="absolute top-4 right-4 w-8 h-8 text-red-500/30 animate-pulse" />
                          <Star className="absolute top-6 right-8 w-4 h-4 text-red-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="relative flex-shrink-0">
                              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg ring-4 ring-red-300/50">
                                <Crown className="w-12 h-12 md:w-16 md:h-16 text-red-900" />
                              </div>
                              <div className="absolute -top-2 -right-2 bg-red-500 text-red-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                                1
                              </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <Trophy className="w-6 h-6 text-red-600" />
                                <h3 className="text-2xl md:text-3xl font-bold text-red-900 dark:text-red-400">
                                  DM Kralı
                                </h3>
                              </div>
                              <Link href={`/oyuncu/${sortedPlayers[0].username}`} className="block group">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 group-hover:text-red-600 transition-colors">
                                  {sortedPlayers[0].username}
                                </h2>
                              </Link>
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                                <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-2">
                                  <div className="text-xs text-muted-foreground mb-1">DM</div>
                                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                    {sortedPlayers[0].totalDm}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                    {(sortedPlayers[1] || sortedPlayers[2]) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedPlayers[1] && (
                          <Card className="overflow-hidden border-2 border-gray-300/50 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900/30 dark:via-slate-900/30 dark:to-gray-800/30 shadow-lg">
                            <div className="relative p-5">
                              <Medal className="absolute top-3 right-3 w-6 h-6 text-gray-400/30" />
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-slate-400 flex items-center justify-center shadow-md ring-2 ring-gray-200/50">
                                    <Medal className="w-8 h-8 text-gray-700" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow">
                                    2
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/oyuncu/${sortedPlayers[1].username}`} className="block group">
                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-gray-600 transition-colors truncate">
                                      {sortedPlayers[1].username}
                                    </h3>
                                  </Link>
                                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                    {sortedPlayers[1].totalDm} DM
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                        {sortedPlayers[2] && (
                          <Card className="overflow-hidden border-2 border-amber-700/50 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-900/20 shadow-lg">
                            <div className="relative p-5">
                              <Medal className="absolute top-3 right-3 w-6 h-6 text-amber-600/30" />
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-md ring-2 ring-amber-500/50">
                                    <Medal className="w-8 h-8 text-amber-100" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 bg-amber-700 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow">
                                    3
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/oyuncu/${sortedPlayers[2].username}`} className="block group">
                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-amber-700 transition-colors truncate">
                                      {sortedPlayers[2].username}
                                    </h3>
                                  </Link>
                                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                    {sortedPlayers[2].totalDm} DM
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}
                    {sortedPlayers.length > 3 && (
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span>🛡️</span> Diğer Sıralamalar
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {sortedPlayers.slice(3).map((player: any, index: number) => (
                              <div key={player.userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-muted-foreground w-6">{index + 4}</span>
                                  <Link href={`/oyuncu/${player.username}`} className="font-medium hover:text-primary transition-colors">
                                    {player.username}
                                  </Link>
                                </div>
                                <span className="font-bold text-red-600">{player.totalDm} DM</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            {/* 🥅 CS */}
            <TabsContent value="cs" className="space-y-4">
              {leaderboardLoading ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">Yükleniyor...</div>
                  </CardContent>
                </Card>
              ) : !leaderboard?.length ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">Henüz CS yok</div>
                  </CardContent>
                </Card>
              ) : (() => {
                const sortedPlayers = leaderboard
                  .filter((p: any) => p.totalCleanSheets > 0)
                  .sort((a: any, b: any) => b.totalCleanSheets - a.totalCleanSheets)
                  .slice(0, 10);
                
                if (sortedPlayers.length === 0) {
                  return (
                    <Card>
                      <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">Henüz CS yok</p>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <div className="space-y-6">
                    {sortedPlayers[0] && (
                      <Card className="overflow-hidden border-2 border-purple-400/50 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-purple-950/20 dark:via-violet-950/20 dark:to-purple-900/20 shadow-xl">
                        <div className="relative p-6 md:p-8">
                          <Sparkles className="absolute top-4 right-4 w-8 h-8 text-purple-500/30 animate-pulse" />
                          <Star className="absolute top-6 right-8 w-4 h-4 text-purple-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="relative flex-shrink-0">
                              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg ring-4 ring-purple-300/50">
                                <Crown className="w-12 h-12 md:w-16 md:h-16 text-purple-900" />
                              </div>
                              <div className="absolute -top-2 -right-2 bg-purple-500 text-purple-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                                1
                              </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <Trophy className="w-6 h-6 text-purple-600" />
                                <h3 className="text-2xl md:text-3xl font-bold text-purple-900 dark:text-purple-400">
                                  CS Kralı
                                </h3>
                              </div>
                              <Link href={`/oyuncu/${sortedPlayers[0].username}`} className="block group">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 group-hover:text-purple-600 transition-colors">
                                  {sortedPlayers[0].username}
                                </h2>
                              </Link>
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                                <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-2">
                                  <div className="text-xs text-muted-foreground mb-1">CS</div>
                                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                                    {sortedPlayers[0].totalCleanSheets}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                    {(sortedPlayers[1] || sortedPlayers[2]) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedPlayers[1] && (
                          <Card className="overflow-hidden border-2 border-gray-300/50 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900/30 dark:via-slate-900/30 dark:to-gray-800/30 shadow-lg">
                            <div className="relative p-5">
                              <Medal className="absolute top-3 right-3 w-6 h-6 text-gray-400/30" />
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-slate-400 flex items-center justify-center shadow-md ring-2 ring-gray-200/50">
                                    <Medal className="w-8 h-8 text-gray-700" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow">
                                    2
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/oyuncu/${sortedPlayers[1].username}`} className="block group">
                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-gray-600 transition-colors truncate">
                                      {sortedPlayers[1].username}
                                    </h3>
                                  </Link>
                                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                    {sortedPlayers[1].totalCleanSheets} CS
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                        {sortedPlayers[2] && (
                          <Card className="overflow-hidden border-2 border-amber-700/50 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-900/20 shadow-lg">
                            <div className="relative p-5">
                              <Medal className="absolute top-3 right-3 w-6 h-6 text-amber-600/30" />
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-md ring-2 ring-amber-500/50">
                                    <Medal className="w-8 h-8 text-amber-100" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 bg-amber-700 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow">
                                    3
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/oyuncu/${sortedPlayers[2].username}`} className="block group">
                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-amber-700 transition-colors truncate">
                                      {sortedPlayers[2].username}
                                    </h3>
                                  </Link>
                                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                    {sortedPlayers[2].totalCleanSheets} CS
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}
                    {sortedPlayers.length > 3 && (
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span>🥅</span> Diğer Sıralamalar
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {sortedPlayers.slice(3).map((player: any, index: number) => (
                              <div key={player.userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-muted-foreground w-6">{index + 4}</span>
                                  <Link href={`/oyuncu/${player.username}`} className="font-medium hover:text-primary transition-colors">
                                    {player.username}
                                  </Link>
                                </div>
                                <span className="font-bold text-purple-600">{player.totalCleanSheets} CS</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            <TabsContent value="totw" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Haftanın Kadrosu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hafta Seçin</label>
                      <Select value={selectedTotwWeek} onValueChange={setSelectedTotwWeek}>
                        <SelectTrigger className="max-w-xs">
                          <SelectValue placeholder="Hafta seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamsOfWeek?.map((totw: any) => (
                            <SelectItem key={totw.id} value={totw.week.toString()}>
                              Hafta {totw.week}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTotw ? (
                      <div className="mt-6">
                        <h3 className="font-semibold mb-4">Hafta {selectedTotw.week} - Haftanın Kadrosu</h3>
                        <img 
                          src={selectedTotw.image} 
                          alt={`Hafta ${selectedTotw.week} Kadrosu`} 
                          className="w-full h-auto rounded-lg border shadow-lg"
                        />
                      </div>
                    ) : selectedTotwWeek ? (
                      <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {teamsOfWeek?.length ? "Lütfen bir hafta seçin" : "Henüz haftanın kadrosu eklenmedi"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
