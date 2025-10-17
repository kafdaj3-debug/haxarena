import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Shield, Clock, Crosshair, Award, Crown, ListOrdered } from "lucide-react";

interface PlayerStats {
  username: string;
  rank: string;
  goals: number;
  assists: number;
  dm: number;
  cs: number;
  saves: number;
  matchTime: number;
  matchesPlayed: number;
}

// Statik veri - Oyun verilerini buraya gireceksiniz
const staticPlayers: PlayerStats[] = [
  { username: "Metehan", rank: "DIAMOND VIP", goals: 145, assists: 89, dm: 12, cs: 8, saves: 234, matchTime: 86400, matchesPlayed: 250 },
  { username: "Emre", rank: "GOLD VIP", goals: 132, assists: 76, dm: 15, cs: 10, saves: 198, matchTime: 79200, matchesPlayed: 230 },
  { username: "Berkay", rank: "DIAMOND VIP", goals: 128, assists: 95, dm: 10, cs: 7, saves: 215, matchTime: 82800, matchesPlayed: 245 },
  { username: "Ahmet", rank: "GOLD VIP", goals: 121, assists: 68, dm: 18, cs: 12, saves: 187, matchTime: 75600, matchesPlayed: 220 },
  { username: "Burak", rank: "SILVER VIP", goals: 115, assists: 82, dm: 8, cs: 5, saves: 201, matchTime: 72000, matchesPlayed: 210 },
  { username: "Cem", rank: "Lig Oyuncusu", goals: 109, assists: 71, dm: 20, cs: 15, saves: 176, matchTime: 68400, matchesPlayed: 200 },
  { username: "Deniz", rank: "DIAMOND VIP", goals: 98, assists: 64, dm: 9, cs: 6, saves: 189, matchTime: 64800, matchesPlayed: 190 },
  { username: "Eren", rank: "GOLD VIP", goals: 94, assists: 58, dm: 11, cs: 7, saves: 165, matchTime: 61200, matchesPlayed: 180 },
  { username: "Furkan", rank: "Lig Oyuncusu", goals: 87, assists: 52, dm: 14, cs: 9, saves: 158, matchTime: 57600, matchesPlayed: 170 },
  { username: "Gökhan", rank: "SILVER VIP", goals: 81, assists: 49, dm: 13, cs: 8, saves: 142, matchTime: 54000, matchesPlayed: 160 },
  { username: "Hakan", rank: "HaxArena Üye", goals: 76, assists: 45, dm: 16, cs: 11, saves: 134, matchTime: 50400, matchesPlayed: 150 },
  { username: "İbrahim", rank: "Lig Oyuncusu", goals: 72, assists: 41, dm: 7, cs: 4, saves: 128, matchTime: 46800, matchesPlayed: 140 },
  { username: "Kaan", rank: "GOLD VIP", goals: 68, assists: 38, dm: 10, cs: 6, saves: 121, matchTime: 43200, matchesPlayed: 130 },
  { username: "Mert", rank: "HaxArena Üye", goals: 64, assists: 35, dm: 12, cs: 8, saves: 115, matchTime: 39600, matchesPlayed: 120 },
  { username: "Onur", rank: "SILVER VIP", goals: 59, assists: 32, dm: 9, cs: 5, saves: 108, matchTime: 36000, matchesPlayed: 110 },
  { username: "Serkan", rank: "Lig Oyuncusu", goals: 55, assists: 29, dm: 11, cs: 7, saves: 102, matchTime: 32400, matchesPlayed: 100 },
  { username: "Tolga", rank: "HaxArena Üye", goals: 51, assists: 26, dm: 8, cs: 4, saves: 96, matchTime: 28800, matchesPlayed: 95 },
  { username: "Uğur", rank: "GOLD VIP", goals: 47, assists: 24, dm: 13, cs: 9, saves: 89, matchTime: 25200, matchesPlayed: 90 },
  { username: "Volkan", rank: "HaxArena Üye", goals: 43, assists: 21, dm: 6, cs: 3, saves: 83, matchTime: 21600, matchesPlayed: 85 },
  { username: "Yusuf", rank: "SILVER VIP", goals: 39, assists: 19, dm: 10, cs: 6, saves: 76, matchTime: 18000, matchesPlayed: 80 },
  { username: "Zafer", rank: "Lig Oyuncusu", goals: 35, assists: 17, dm: 7, cs: 4, saves: 70, matchTime: 14400, matchesPlayed: 75 },
  { username: "Alper", rank: "HaxArena Üye", goals: 31, assists: 15, dm: 9, cs: 5, saves: 64, matchTime: 10800, matchesPlayed: 70 },
  { username: "Barış", rank: "DIAMOND VIP", goals: 28, assists: 13, dm: 5, cs: 2, saves: 58, matchTime: 7200, matchesPlayed: 65 },
  { username: "Efe", rank: "GOLD VIP", goals: 24, assists: 11, dm: 8, cs: 4, saves: 52, matchTime: 3600, matchesPlayed: 60 },
  { username: "Okan", rank: "HaxArena Üye", goals: 20, assists: 9, dm: 6, cs: 3, saves: 46, matchTime: 1800, matchesPlayed: 55 }
];

type ViewCategory = 'best6' | 'goals' | 'assists' | 'dm' | 'cs' | 'saves' | 'matchTime' | 'top25';

export default function StatisticsPage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeView, setActiveView] = useState<ViewCategory>('best6');

  // Format seconds to Turkish time format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} saat ${minutes} dakika`;
  };

  // Get players based on active view
  const getPlayers = () => {
    if (activeView === 'best6') {
      // Best 6: TOP 25 genel sıralamasından ilk 6 kişi (gol bazlı)
      return [...staticPlayers]
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 6);
    } else if (activeView === 'top25') {
      // TOP 25: Tüm oyuncular
      return staticPlayers.slice(0, 25);
    } else {
      // Kategorilere göre top 10
      return [...staticPlayers]
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
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Best 6</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-1" data-testid="tab-goals">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Gol</span>
              </TabsTrigger>
              <TabsTrigger value="assists" className="gap-1" data-testid="tab-assists">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Asist</span>
              </TabsTrigger>
              <TabsTrigger value="dm" className="gap-1" data-testid="tab-dm">
                <Crosshair className="w-4 h-4" />
                <span className="hidden sm:inline">DM</span>
              </TabsTrigger>
              <TabsTrigger value="cs" className="gap-1" data-testid="tab-cs">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">CS</span>
              </TabsTrigger>
              <TabsTrigger value="saves" className="gap-1" data-testid="tab-saves">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Kurtarış</span>
              </TabsTrigger>
              <TabsTrigger value="matchTime" className="gap-1" data-testid="tab-matchtime">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Süre</span>
              </TabsTrigger>
              <TabsTrigger value="top25" className="gap-1" data-testid="tab-top25">
                <ListOrdered className="w-4 h-4" />
                <span className="hidden sm:inline">TOP 25</span>
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
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="w-4 h-4" />
                        Gol
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      <div className="flex items-center justify-center gap-1">
                        <Target className="w-4 h-4" />
                        Asist
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">DM</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">CS</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      <div className="flex items-center justify-center gap-1">
                        <Shield className="w-4 h-4" />
                        Kurtarış
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        Süre
                      </div>
                    </th>
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
                        <td className="px-4 py-3 text-sm font-medium">
                          <Link 
                            href={`/oyuncu/${player.username}`} 
                            className="text-primary hover:underline cursor-pointer"
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
                          {player.dm}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-player-cs-${index}`}>
                          {player.cs}
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
