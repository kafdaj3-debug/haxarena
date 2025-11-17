import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Trophy, Award, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

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

  // Group fixtures by week
  const fixturesByWeek = fixtures?.reduce((acc, fixture) => {
    if (!acc[fixture.week]) {
      acc[fixture.week] = [];
    }
    acc[fixture.week].push(fixture);
    return acc;
  }, {} as Record<number, any[]>) || {};

  const weeks = Object.keys(fixturesByWeek).sort((a, b) => parseInt(a) - parseInt(b));

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
                            const isTopThree = index < 3;
                            const rankClass = index === 0 
                              ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30" 
                              : index === 1 
                              ? "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30" 
                              : index === 2 
                              ? "bg-gradient-to-r from-orange-600/20 to-orange-700/10 border-orange-600/30" 
                              : "";
                            
                            return (
                            <tr 
                              key={team.id} 
                              className={`border-b transition-colors ${isTopThree ? `${rankClass} hover:opacity-90` : "hover:bg-muted/50"}`}
                              data-testid={`row-team-${team.id}`}
                            >
                              <td className="p-3 font-bold text-center">
                                {isTopThree ? (
                                  <span className={index === 0 ? "text-yellow-600" : index === 1 ? "text-gray-500" : "text-orange-600"}>{index + 1}</span>
                                ) : (
                                  index + 1
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  {team.logo && (
                                    <img 
                                      src={team.logo} 
                                      alt={team.name} 
                                      className={`object-contain ${isTopThree ? "w-10 h-10" : "w-8 h-8"}`}
                                    />
                                  )}
                                  <span className={`font-medium ${isTopThree ? "text-lg" : ""}`}>{team.name}</span>
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
                              <td className={`p-3 text-center font-bold ${isTopThree ? index === 0 ? "text-yellow-600 text-lg" : index === 1 ? "text-gray-500 text-lg" : "text-orange-600 text-lg" : "text-primary"}`}>
                                {team.points}
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-4 text-xs text-muted-foreground space-y-1">
                    <p><strong>O:</strong> Oynanan, <strong>G:</strong> Galibiyet, <strong>B:</strong> Beraberlik, <strong>M:</strong> Mağlubiyet</p>
                    <p><strong>A:</strong> Atılan Gol, <strong>Y:</strong> Yenilen Gol, <strong>AV:</strong> Averaj, <strong>İA:</strong> İkili Averaj, <strong>P:</strong> Puan</p>
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
                                      .map((goal: any, idx: number) => (
                                        <div key={idx} className="text-xs flex items-center gap-2">
                                          <span className="font-medium">{goal.minute}'</span>
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
                                      ))}
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
                            <div className="flex items-center gap-3 flex-1">
                              {isBye && fixture.byeSide === "home" ? (
                                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded border border-blue-500/50">
                                  <span className="font-bold text-blue-600 text-xs">BAY</span>
                                </div>
                              ) : fixture.homeTeam?.logo ? (
                                <img 
                                  src={fixture.homeTeam.logo} 
                                  alt={fixture.homeTeam.name} 
                                  className="w-10 h-10 object-contain"
                                />
                              ) : null}
                              <span className="font-medium text-right flex-1">
                                {isBye && fixture.byeSide === "home" ? (
                                  <span className="text-blue-600 font-bold">BAY</span>
                                ) : (
                                  fixture.homeTeam?.name || "BAY"
                                )}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-center min-w-[100px]">
                              {isBye ? (
                                <span className="text-blue-600 font-bold text-sm bg-blue-500/20 px-3 py-1 rounded border border-blue-500/50">BAY GEÇME</span>
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
                                <span className="text-muted-foreground font-medium">VS</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 flex-1">
                              <span className="font-medium flex-1">
                                {isBye && fixture.byeSide === "away" ? (
                                  <span className="text-blue-600 font-bold">BAY</span>
                                ) : (
                                  fixture.awayTeam?.name || "BAY"
                                )}
                              </span>
                              {isBye && fixture.byeSide === "away" ? (
                                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded border border-blue-500/50">
                                  <span className="font-bold text-blue-600 text-xs">BAY</span>
                                </div>
                              ) : fixture.awayTeam?.logo ? (
                                <img 
                                  src={fixture.awayTeam.logo} 
                                  alt={fixture.awayTeam.name} 
                                  className="w-10 h-10 object-contain"
                                />
                              ) : null}
                            </div>
                            {!isBye && (
                              <div className="mt-3 space-y-2">
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
                                        .map((goal: any, idx: number) => (
                                          <div key={idx} className="text-xs text-center">
                                            <span className="font-medium">{goal.minute}'</span>
                                            <span> {goal.playerName || goal.player?.username || "Bilinmeyen"}</span>
                                            {(goal.assistPlayerName || goal.assistPlayer) && (
                                              <span className="text-muted-foreground">
                                                {" "}(Asist: {goal.assistPlayerName || goal.assistPlayer?.username || "Bilinmeyen"})
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>⚽</span> Gol Krallığı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboardLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                  ) : !leaderboard?.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Henüz gol atan yok
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard
                        .filter((p: any) => p.totalGoals > 0)
                        .sort((a: any, b: any) => b.totalGoals - a.totalGoals)
                        .slice(0, 10)
                        .map((player: any, index: number) => (
                          <div 
                            key={player.userId} 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${index === 0 ? "text-yellow-600 text-lg" : "text-muted-foreground"}`}>
                                {index + 1}
                              </span>
                              <span className="font-medium">{player.username}</span>
                            </div>
                            <span className="font-bold text-primary">{player.totalGoals} Gol</span>
                          </div>
                        ))}
                      {leaderboard.filter((p: any) => p.totalGoals > 0).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Henüz gol atan yok</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 🎯 Asist Krallığı */}
            <TabsContent value="assists" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🎯</span> Asist Krallığı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboardLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                  ) : !leaderboard?.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Henüz asist yapan yok
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard
                        .filter((p: any) => p.totalAssists > 0)
                        .sort((a: any, b: any) => b.totalAssists - a.totalAssists)
                        .slice(0, 10)
                        .map((player: any, index: number) => (
                          <div 
                            key={player.userId} 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${index === 0 ? "text-blue-600 text-lg" : "text-muted-foreground"}`}>
                                {index + 1}
                              </span>
                              <span className="font-medium">{player.username}</span>
                            </div>
                            <span className="font-bold text-blue-600">{player.totalAssists} Asist</span>
                          </div>
                        ))}
                      {leaderboard.filter((p: any) => p.totalAssists > 0).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Henüz asist yapan yok</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 🧤 En Çok Kurtarış */}
            <TabsContent value="saves" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🧤</span> En Çok Kurtarış
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboardLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                  ) : !leaderboard?.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Henüz kurtarış yapan yok
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard
                        .filter((p: any) => p.totalSaves > 0)
                        .sort((a: any, b: any) => b.totalSaves - a.totalSaves)
                        .slice(0, 10)
                        .map((player: any, index: number) => (
                          <div 
                            key={player.userId} 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${index === 0 ? "text-green-600 text-lg" : "text-muted-foreground"}`}>
                                {index + 1}
                              </span>
                              <span className="font-medium">{player.username}</span>
                            </div>
                            <span className="font-bold text-green-600">{player.totalSaves} Kurtarış</span>
                          </div>
                        ))}
                      {leaderboard.filter((p: any) => p.totalSaves > 0).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Henüz kurtarış yapan yok</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 🛡️ DM */}
            <TabsContent value="dm" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🛡️</span> DM
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboardLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                  ) : !leaderboard?.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Henüz DM yok
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard
                        .filter((p: any) => p.totalDm > 0)
                        .sort((a: any, b: any) => b.totalDm - a.totalDm)
                        .slice(0, 10)
                        .map((player: any, index: number) => (
                          <div 
                            key={player.userId} 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${index === 0 ? "text-red-600 text-lg" : "text-muted-foreground"}`}>
                                {index + 1}
                              </span>
                              <span className="font-medium">{player.username}</span>
                            </div>
                            <span className="font-bold text-red-600">{player.totalDm} DM</span>
                          </div>
                        ))}
                      {leaderboard.filter((p: any) => p.totalDm > 0).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Henüz DM yok</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 🥅 CS */}
            <TabsContent value="cs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🥅</span> CS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboardLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                  ) : !leaderboard?.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Henüz CS yok
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard
                        .filter((p: any) => p.totalCleanSheets > 0)
                        .sort((a: any, b: any) => b.totalCleanSheets - a.totalCleanSheets)
                        .slice(0, 10)
                        .map((player: any, index: number) => (
                          <div 
                            key={player.userId} 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${index === 0 ? "text-purple-600 text-lg" : "text-muted-foreground"}`}>
                                {index + 1}
                              </span>
                              <span className="font-medium">{player.username}</span>
                            </div>
                            <span className="font-bold text-purple-600">{player.totalCleanSheets} CS</span>
                          </div>
                        ))}
                      {leaderboard.filter((p: any) => p.totalCleanSheets > 0).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Henüz CS yok</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
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
