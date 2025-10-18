import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Shield, Clock, Crown, ListOrdered, Crosshair, Award } from "lucide-react";
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

          {/* Statistics Table */}
          <Card className="overflow-hidden">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <TableIcon className="w-5 h-5 text-primary" />
                  {tableTitle}
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
                    {players.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-8 text-muted-foreground">
                          Henüz istatistik bulunmuyor
                        </td>
                      </tr>
                    ) : (
                    players.map((player, index) => (
                      <tr 
                        key={index} 
                        className="border-b hover-elevate"
                        data-testid={`row-player-${index}`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {player.username}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
