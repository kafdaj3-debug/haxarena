import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Trophy, Target, Shield, Clock, Medal, Crosshair, Award } from "lucide-react";

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

  // Format seconds to Turkish time format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} saat ${minutes} dakika`;
  };

  // Get top players by goals (Best 6)
  const top6Players = [...staticPlayers]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 6);

  // Get top 10 for each category
  const getTop10 = (key: keyof Omit<PlayerStats, 'username' | 'rank'>) => {
    return [...staticPlayers]
      .sort((a, b) => b[key] - a[key])
      .slice(0, 10);
  };

  const categories = [
    { key: 'goals' as const, label: 'Gol Top 10', icon: Trophy },
    { key: 'assists' as const, label: 'Asist Top 10', icon: Target },
    { key: 'dm' as const, label: 'DM Top 10', icon: Crosshair },
    { key: 'cs' as const, label: 'CS Top 10', icon: Award },
    { key: 'saves' as const, label: 'Kurtarış Top 10', icon: Shield },
    { key: 'matchTime' as const, label: 'Süre Top 10', icon: Clock },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Page title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leaderboards</h1>
            <p className="text-muted-foreground mt-2">Oyuncu sıralamaları</p>
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

          {/* Top 10 Categories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((category) => {
              const top10 = getTop10(category.key);
              const CategoryIcon = category.icon;
              
              return (
                <Card key={category.key} className="overflow-hidden">
                  <div className="p-4 bg-muted/50 border-b">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      <CategoryIcon className="w-5 h-5 text-primary" />
                      {category.label}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {top10.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          Henüz veri yok
                        </div>
                      ) : (
                        top10.map((player, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between py-2 px-3 rounded-md hover-elevate"
                            data-testid={`${category.key}-player-${index}`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-sm font-bold text-muted-foreground w-6">
                                #{index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-foreground text-sm">
                                  {player.username}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {player.rank}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm font-bold text-primary">
                              {category.key === 'matchTime' 
                                ? formatTime(player[category.key])
                                : player[category.key]
                              }
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
