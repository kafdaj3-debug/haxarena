import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Shield, Clock, Crown, ListOrdered, Crosshair, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function StatisticsPage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeView, setActiveView] = useState<ViewCategory>('best6');

  // Fetch players from database
  const { data: allPlayers = [], isLoading } = useQuery<PlayerStats[]>({
    queryKey: ['/api/stats'],
  });

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
          {isLoading ? (
            <Card>
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ) : (
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
