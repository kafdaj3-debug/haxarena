import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Shield, Clock, Crown, ListOrdered, Crosshair, Award, Medal, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";

interface PlayerStats {
  username: string;
  rank: string;
  goals: number;
  assists: number;
  saves: number;
  matchTime: number;
  matchesPlayed: number;
  dm: number;
  cs: number;
}

type ViewCategory = 'best6' | 'goals' | 'assists' | 'dm' | 'cs' | 'saves' | 'matchTime' | 'top25';

// Test verileri (gerçek database yerine)
const testPlayers: PlayerStats[] = [
  { username: "Oyuncu1", rank: "Elmas", goals: 245, assists: 180, saves: 95, matchTime: 864000, matchesPlayed: 420, dm: 35, cs: 28 },
  { username: "Oyuncu2", rank: "Platin", goals: 198, assists: 165, saves: 88, matchTime: 720000, matchesPlayed: 380, dm: 30, cs: 25 },
  { username: "Oyuncu3", rank: "Altın", goals: 175, assists: 145, saves: 82, matchTime: 648000, matchesPlayed: 350, dm: 28, cs: 22 },
  { username: "Oyuncu4", rank: "Gümüş", goals: 152, assists: 130, saves: 75, matchTime: 576000, matchesPlayed: 320, dm: 25, cs: 20 },
  { username: "Oyuncu5", rank: "Bronz", goals: 138, assists: 118, saves: 68, matchTime: 504000, matchesPlayed: 290, dm: 22, cs: 18 },
  { username: "Oyuncu6", rank: "Bronz", goals: 125, assists: 105, saves: 62, matchTime: 432000, matchesPlayed: 260, dm: 20, cs: 16 },
  { username: "Oyuncu7", rank: "Elmas", goals: 118, assists: 98, saves: 58, matchTime: 396000, matchesPlayed: 245, dm: 18, cs: 15 },
  { username: "Oyuncu8", rank: "Platin", goals: 105, assists: 88, saves: 52, matchTime: 360000, matchesPlayed: 230, dm: 16, cs: 14 },
  { username: "Oyuncu9", rank: "Altın", goals: 95, assists: 78, saves: 48, matchTime: 324000, matchesPlayed: 215, dm: 15, cs: 12 },
  { username: "Oyuncu10", rank: "Gümüş", goals: 88, assists: 72, saves: 45, matchTime: 288000, matchesPlayed: 200, dm: 14, cs: 11 },
];

export default function StatisticsPage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeView, setActiveView] = useState<ViewCategory>('best6');

  // Test verileri kullan
  const allPlayers = testPlayers;
  const isLoading = false;

  // Format seconds to detailed Turkish time format (ALWAYS shows ALL components)
  const formatTime = (seconds: number) => {
    let remainder = seconds;
    
    const weeks = Math.floor(remainder / (7 * 24 * 3600));
    remainder = remainder % (7 * 24 * 3600);
    
    const days = Math.floor(remainder / (24 * 3600));
    remainder = remainder % (24 * 3600);
    
    const hours = Math.floor(remainder / 3600);
    remainder = remainder % 3600;
    
    const minutes = Math.floor(remainder / 60);
    const secs = remainder % 60;

    const parts = [];
    parts.push(`${weeks} hafta`);
    parts.push(`${days} gün`);
    parts.push(`${hours} saat`);
    parts.push(`${minutes} dakika`);
    parts.push(`${secs} saniye`);

    return parts.join(' ');
  };

  // Get players based on active view
  const getPlayers = () => {
    if (activeView === 'best6') {
      // Best 6: TOP 25 genel sıralamasından ilk 6 kişi (gol bazlı)
      return [...allPlayers]
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 6);
    } else if (activeView === 'top25') {
      // TOP 25: Tüm oyuncular
      return allPlayers.slice(0, 25);
    } else {
      // Kategorilere göre top 10
      return [...allPlayers]
        .sort((a, b) => b[activeView] - a[activeView])
        .slice(0, 10);
    }
  };

  // Get stat value for current category
  const getStatValue = (player: PlayerStats) => {
    switch (activeView) {
      case 'goals': return player.goals;
      case 'assists': return player.assists;
      case 'dm': return player.dm;
      case 'cs': return player.cs;
      case 'saves': return player.saves;
      case 'matchTime': return player.matchTime;
      default: return player.goals;
    }
  };

  // Get stat label for current category
  const getStatLabel = () => {
    switch (activeView) {
      case 'goals': return 'Gol';
      case 'assists': return 'Asist';
      case 'dm': return 'DM';
      case 'cs': return 'CS';
      case 'saves': return 'Kurtarış';
      case 'matchTime': return 'Süre';
      default: return 'Gol';
    }
  };

  // Get table title based on active view
  const getTableTitle = () => {
    const titles = {
      best6: 'Best 6',
      goals: 'Gol - Top 10',
      assists: 'Asist - Top 10',
      dm: 'DM - Top 10',
      cs: 'CS - Top 10',
      saves: 'Kurtarış - Top 10',
      matchTime: 'Süre - Top 10',
      top25: 'TOP 25'
    };
    return titles[activeView];
  };

  // Get table icon based on active view
  const getTableIcon = () => {
    const icons = {
      best6: Crown,
      goals: Trophy,
      assists: Target,
      dm: Crosshair,
      cs: Award,
      saves: Shield,
      matchTime: Clock,
      top25: ListOrdered
    };
    return icons[activeView];
  };

  const players = getPlayers();
  const tableTitle = getTableTitle();
  const TableIcon = getTableIcon();

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Page title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">İSTATİSTİKLER</h1>
            <p className="text-muted-foreground mt-2">Kategorilere göre sıralamalar</p>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewCategory)}>
            <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full mb-6">
              <TabsTrigger value="best6" className="gap-1" data-testid="tab-best6">
                👑 <span className="hidden sm:inline">Best 6</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-1" data-testid="tab-goals">
                ⚽ <span className="hidden sm:inline">Gol</span>
              </TabsTrigger>
              <TabsTrigger value="assists" className="gap-1" data-testid="tab-assists">
                🎯 <span className="hidden sm:inline">Asist</span>
              </TabsTrigger>
              <TabsTrigger value="dm" className="gap-1" data-testid="tab-dm">
                🛡️ <span className="hidden sm:inline">DM</span>
              </TabsTrigger>
              <TabsTrigger value="cs" className="gap-1" data-testid="tab-cs">
                🥅 <span className="hidden sm:inline">CS</span>
              </TabsTrigger>
              <TabsTrigger value="saves" className="gap-1" data-testid="tab-saves">
                🧤 <span className="hidden sm:inline">Kurtarış</span>
              </TabsTrigger>
              <TabsTrigger value="matchTime" className="gap-1" data-testid="tab-matchtime">
                ⏱️ <span className="hidden sm:inline">Süre</span>
              </TabsTrigger>
              <TabsTrigger value="top25" className="gap-1" data-testid="tab-top25">
                🏆 <span className="hidden sm:inline">TOP 25</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Statistics Display */}
          {players.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                Henüz istatistik bulunmuyor
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Best 6 Special Layout */}
              {activeView === 'best6' && players.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {players.map((player, index) => (
                    <Card 
                      key={index}
                      className={`overflow-hidden transition-all hover:scale-105 hover:shadow-xl ${
                        index === 0 
                          ? 'border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-yellow-900/20 shadow-lg' 
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <div className="relative p-5">
                        {index === 0 && (
                          <>
                            <Sparkles className="absolute top-3 right-3 w-5 h-5 text-yellow-500/30 animate-pulse" />
                            <Crown className="absolute top-2 right-2 w-6 h-6 text-yellow-600/50" />
                          </>
                        )}
                        <div className="flex items-center gap-4">
                          <div className={`relative flex-shrink-0 ${
                            index === 0 ? 'w-16 h-16' : 'w-12 h-12'
                          }`}>
                            <div className={`w-full h-full rounded-full flex items-center justify-center shadow-md ${
                              index === 0 
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-500 ring-2 ring-yellow-300/50' 
                                : index === 1
                                ? 'bg-gradient-to-br from-gray-300 to-slate-400 ring-2 ring-gray-200/50'
                                : index === 2
                                ? 'bg-gradient-to-br from-amber-600 to-orange-700 ring-2 ring-amber-500/50'
                                : 'bg-gradient-to-br from-primary/20 to-primary/40'
                            }`}>
                              {index === 0 ? (
                                <Crown className={`${index === 0 ? 'w-8 h-8' : 'w-6 h-6'} text-yellow-900`} />
                              ) : index < 3 ? (
                                <Medal className={`${index === 0 ? 'w-8 h-8' : 'w-6 h-6'} ${index === 1 ? 'text-gray-700' : 'text-amber-100'}`} />
                              ) : (
                                <Trophy className={`${index === 0 ? 'w-8 h-8' : 'w-6 h-6'} text-primary`} />
                              )}
                            </div>
                            <div className={`absolute -top-1 -right-1 rounded-full flex items-center justify-center font-bold text-xs shadow ${
                              index === 0 
                                ? 'bg-yellow-500 text-yellow-900 w-7 h-7' 
                                : index === 1
                                ? 'bg-gray-400 text-white w-6 h-6'
                                : index === 2
                                ? 'bg-amber-700 text-white w-6 h-6'
                                : 'bg-primary text-primary-foreground w-5 h-5'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/oyuncu/${player.username}`}
                              className="block group"
                            >
                              <h3 className={`font-bold mb-1 group-hover:text-primary transition-colors truncate ${
                                index === 0 ? 'text-xl text-foreground' : 'text-lg text-foreground'
                              }`}>
                                {player.username}
                              </h3>
                            </Link>
                            <div className="text-xs text-muted-foreground mb-2">{player.rank}</div>
                            <div className="flex items-center gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">⚽</span>
                                <span className="font-semibold ml-1">{player.goals}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">🎯</span>
                                <span className="font-semibold ml-1">{player.assists}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* 1st Place - Special Card (for category views) */}
              {players.length > 0 && (activeView !== 'best6' && activeView !== 'top25') && (
                <Card className="overflow-hidden border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-yellow-900/20 shadow-xl">
                  <div className="relative p-6 md:p-8">
                    {/* Sparkle effects */}
                    <Sparkles className="absolute top-4 right-4 w-8 h-8 text-yellow-500/30 animate-pulse" />
                    <Star className="absolute top-6 right-8 w-4 h-4 text-yellow-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                      {/* Medal/Icon */}
                      <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg ring-4 ring-yellow-300/50">
                          <Crown className="w-12 h-12 md:w-16 md:h-16 text-yellow-900" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                          1
                        </div>
                      </div>
                      
                      {/* Player Info */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <Trophy className="w-6 h-6 text-yellow-600" />
                          <h3 className="text-2xl md:text-3xl font-bold text-yellow-900 dark:text-yellow-400">
                            {getStatLabel()} Kralı
                          </h3>
                        </div>
                        <Link 
                          href={`/oyuncu/${players[0].username}`}
                          className="block group"
                        >
                          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 group-hover:text-yellow-600 transition-colors">
                            {players[0].username}
                          </h2>
                        </Link>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                          <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-2">
                            <div className="text-xs text-muted-foreground mb-1">Rütbe</div>
                            <div className="font-semibold text-foreground">{players[0].rank}</div>
                          </div>
                          <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-2">
                            <div className="text-xs text-muted-foreground mb-1">{getStatLabel()}</div>
                            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                              {activeView === 'matchTime' ? formatTime(getStatValue(players[0])) : getStatValue(players[0])}
                            </div>
                          </div>
                          <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-2">
                            <div className="text-xs text-muted-foreground mb-1">Maç</div>
                            <div className="font-semibold text-foreground">{players[0].matchesPlayed}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* 2nd and 3rd Place - Special Cards */}
              {players.length > 1 && (activeView !== 'best6' && activeView !== 'top25') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 2nd Place */}
                  {players[1] && (
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
                              href={`/oyuncu/${players[1].username}`}
                              className="block group"
                            >
                              <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-gray-600 transition-colors truncate">
                                {players[1].username}
                              </h3>
                            </Link>
                            <div className="text-sm text-muted-foreground mb-2">{players[1].rank}</div>
                            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                              {activeView === 'matchTime' ? formatTime(getStatValue(players[1])) : getStatValue(players[1])}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* 3rd Place */}
                  {players[2] && (
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
                              href={`/oyuncu/${players[2].username}`}
                              className="block group"
                            >
                              <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-amber-700 transition-colors truncate">
                                {players[2].username}
                              </h3>
                            </Link>
                            <div className="text-sm text-muted-foreground mb-2">{players[2].rank}</div>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                              {activeView === 'matchTime' ? formatTime(getStatValue(players[2])) : getStatValue(players[2])}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Rest of the players - Table */}
              {players.length > (activeView !== 'best6' && activeView !== 'top25' ? 3 : 0) && (
                <Card className="overflow-hidden">
                  <div className="p-4 bg-muted/50 border-b">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      <TableIcon className="w-5 h-5 text-primary" />
                      {activeView !== 'best6' && activeView !== 'top25' ? 'Diğer Sıralamalar' : tableTitle}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">#</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Kullanıcı Adı</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Rütbe</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Oynanan Maç</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">⚽ Gol</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">🎯 Asist</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">🛡️ DM</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">🥅 CS</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">🧤 Kurtarış</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">⏱️ Süre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.slice(activeView !== 'best6' && activeView !== 'top25' ? 3 : 0).map((player, index) => {
                          const actualIndex = activeView !== 'best6' && activeView !== 'top25' ? index + 4 : index + 1;
                          return (
                            <tr 
                              key={index} 
                              className="border-b hover:bg-muted/30 transition-colors"
                              data-testid={`row-player-${index}`}
                            >
                              <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                                {actualIndex}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">
                                <Link 
                                  href={`/oyuncu/${player.username}`} 
                                  className="text-primary hover:underline cursor-pointer font-semibold"
                                  data-testid={`link-player-${index}`}
                                >
                                  {player.username}
                                </Link>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">
                                {player.rank}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-player-matches-${index}`}>
                                {player.matchesPlayed}
                              </td>
                              <td className="px-4 py-3 text-sm text-center font-semibold text-foreground" data-testid={`text-player-goals-${index}`}>
                                {player.goals}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-player-assists-${index}`}>
                                {player.assists}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-player-dm-${index}`}>
                                {player.dm || 0}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-player-cs-${index}`}>
                                {player.cs || 0}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-player-saves-${index}`}>
                                {player.saves}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-player-playtime-${index}`}>
                                {formatTime(player.matchTime)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
