import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Trophy, Target, Shield, Clock, Medal } from "lucide-react";

interface PlayerStats {
  username: string;
  rank: string;
  goals: number;
  assists: number;
  dm: number;
  cs: number;
  saves: number;
  matchTime: number;
}

// Statik veri - Oyun verilerini buraya gireceksiniz
const staticPlayers: PlayerStats[] = [
  // Örnek veri - buraya gerçek oyun verilerini gireceksiniz
  // { username: "OyuncuAdı", rank: "Rütbe", goals: 0, assists: 0, dm: 0, cs: 0, saves: 0, matchTime: 0 }
];

export default function StatisticsPage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  // Format seconds to hours:minutes
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Sort stats based on goals (default) and limit to 50 players
  const sortedStats = [...staticPlayers]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 50);

  // Get top 6 players by goals from sorted list
  const top6Players = sortedStats.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Page title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Oyuncu İstatistikleri</h1>
            <p className="text-muted-foreground mt-2">Tüm oyuncuların performans istatistikleri</p>
          </div>

          {/* Best 6 Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Medal className="w-6 h-6 text-primary" />
              Best 6
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {top6Players.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Henüz oyuncu verisi eklenmedi
                </div>
              ) : (
                top6Players.map((player, index) => (
                  <Card 
                    key={index} 
                    className="p-4 hover-elevate"
                    data-testid={`card-top-player-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-primary">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground" data-testid={`text-username-${index}`}>
                          {player.username}
                        </div>
                        <div className="text-sm text-muted-foreground">{player.rank}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary" data-testid={`text-goals-${index}`}>
                          {player.goals}
                        </div>
                        <div className="text-xs text-muted-foreground">Gol</div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* All Players Statistics Table */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Tüm Oyuncular (Max 50)</h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Kullanıcı Adı</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Rütbe</th>
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
                          Maç Süresi
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStats.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-muted-foreground">
                          Henüz istatistik bulunmuyor
                        </td>
                      </tr>
                    ) : (
                      sortedStats.map((player, index) => (
                        <tr 
                          key={index} 
                          className="border-b hover-elevate"
                          data-testid={`row-player-${index}`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground" data-testid={`text-player-name-${index}`}>
                            {player.username}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {player.rank}
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
        </div>
      </main>
    </div>
  );
}
