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
  { username: "Metehan", rank: "DIAMOND VIP", goals: 145, assists: 89, dm: 12, cs: 8, saves: 234, matchTime: 86400 },
  { username: "Emre", rank: "GOLD VIP", goals: 132, assists: 76, dm: 15, cs: 10, saves: 198, matchTime: 79200 },
  { username: "Berkay", rank: "DIAMOND VIP", goals: 128, assists: 95, dm: 10, cs: 7, saves: 215, matchTime: 82800 },
  { username: "Ahmet", rank: "GOLD VIP", goals: 121, assists: 68, dm: 18, cs: 12, saves: 187, matchTime: 75600 },
  { username: "Burak", rank: "SILVER VIP", goals: 115, assists: 82, dm: 8, cs: 5, saves: 201, matchTime: 72000 },
  { username: "Cem", rank: "Lig Oyuncusu", goals: 109, assists: 71, dm: 20, cs: 15, saves: 176, matchTime: 68400 },
  { username: "Deniz", rank: "DIAMOND VIP", goals: 98, assists: 64, dm: 9, cs: 6, saves: 189, matchTime: 64800 },
  { username: "Eren", rank: "GOLD VIP", goals: 94, assists: 58, dm: 11, cs: 7, saves: 165, matchTime: 61200 },
  { username: "Furkan", rank: "Lig Oyuncusu", goals: 87, assists: 52, dm: 14, cs: 9, saves: 158, matchTime: 57600 },
  { username: "Gökhan", rank: "SILVER VIP", goals: 81, assists: 49, dm: 13, cs: 8, saves: 142, matchTime: 54000 },
  { username: "Hakan", rank: "HaxArena Üye", goals: 76, assists: 45, dm: 16, cs: 11, saves: 134, matchTime: 50400 },
  { username: "İbrahim", rank: "Lig Oyuncusu", goals: 72, assists: 41, dm: 7, cs: 4, saves: 128, matchTime: 46800 },
  { username: "Kaan", rank: "GOLD VIP", goals: 68, assists: 38, dm: 10, cs: 6, saves: 121, matchTime: 43200 },
  { username: "Mert", rank: "HaxArena Üye", goals: 64, assists: 35, dm: 12, cs: 8, saves: 115, matchTime: 39600 },
  { username: "Onur", rank: "SILVER VIP", goals: 59, assists: 32, dm: 9, cs: 5, saves: 108, matchTime: 36000 },
  { username: "Serkan", rank: "Lig Oyuncusu", goals: 55, assists: 29, dm: 11, cs: 7, saves: 102, matchTime: 32400 },
  { username: "Tolga", rank: "HaxArena Üye", goals: 51, assists: 26, dm: 8, cs: 4, saves: 96, matchTime: 28800 },
  { username: "Uğur", rank: "GOLD VIP", goals: 47, assists: 24, dm: 13, cs: 9, saves: 89, matchTime: 25200 },
  { username: "Volkan", rank: "HaxArena Üye", goals: 43, assists: 21, dm: 6, cs: 3, saves: 83, matchTime: 21600 },
  { username: "Yusuf", rank: "SILVER VIP", goals: 39, assists: 19, dm: 10, cs: 6, saves: 76, matchTime: 18000 },
  { username: "Zafer", rank: "Lig Oyuncusu", goals: 35, assists: 17, dm: 7, cs: 4, saves: 70, matchTime: 14400 },
  { username: "Alper", rank: "HaxArena Üye", goals: 31, assists: 15, dm: 9, cs: 5, saves: 64, matchTime: 10800 },
  { username: "Barış", rank: "DIAMOND VIP", goals: 28, assists: 13, dm: 5, cs: 2, saves: 58, matchTime: 7200 },
  { username: "Efe", rank: "GOLD VIP", goals: 24, assists: 11, dm: 8, cs: 4, saves: 52, matchTime: 3600 },
  { username: "Okan", rank: "HaxArena Üye", goals: 20, assists: 9, dm: 6, cs: 3, saves: 46, matchTime: 1800 }
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
