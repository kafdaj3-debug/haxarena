import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Shield, Clock, Crosshair, Award } from "lucide-react";

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

type SortCategory = 'goals' | 'assists' | 'dm' | 'cs' | 'saves' | 'matchTime';

export default function StatisticsPage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState<SortCategory>('goals');

  // Format seconds to Turkish time format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} saat ${minutes} dakika`;
  };

  // Get category details
  const getCategoryDetails = (category: SortCategory) => {
    const details = {
      goals: { label: 'Gol', icon: Trophy },
      assists: { label: 'Asist', icon: Target },
      dm: { label: 'DM', icon: Crosshair },
      cs: { label: 'CS', icon: Award },
      saves: { label: 'Kurtarış', icon: Shield },
      matchTime: { label: 'Süre', icon: Clock }
    };
    return details[category];
  };

  // Get top 10 for Best 6 section
  const getTop10ForCategory = (category: SortCategory) => {
    return [...staticPlayers]
      .sort((a, b) => b[category] - a[category])
      .slice(0, 10);
  };

  const top10Players = getTop10ForCategory(activeCategory);
  const categoryDetails = getCategoryDetails(activeCategory);
  const CategoryIcon = categoryDetails.icon;

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

          {/* Best 6 Section - Top 10 with category tabs */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Best 6</h2>
            
            <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as SortCategory)}>
              <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full md:w-auto mb-4">
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
              </TabsList>
            </Tabs>

            {/* Top 10 table for selected category */}
            <Card className="overflow-hidden">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <CategoryIcon className="w-5 h-5 text-primary" />
                  {categoryDetails.label} - Top 10
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Kullanıcı Adı</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                        {categoryDetails.label}
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                        Oynanan Maç
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {top10Players.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                          Henüz istatistik bulunmuyor
                        </td>
                      </tr>
                    ) : (
                      top10Players.map((player, index) => (
                        <tr 
                          key={index} 
                          className="border-b hover-elevate"
                          data-testid={`row-best6-player-${index}`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground" data-testid={`text-best6-player-name-${index}`}>
                            {player.username}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-foreground" data-testid={`text-best6-player-value-${index}`}>
                            {activeCategory === 'matchTime' ? formatTime(player[activeCategory]) : player[activeCategory]}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-best6-player-matches-${index}`}>
                            {player.matchesPlayed}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* TOP 50 Section - Full detailed stats */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">TOP 50</h2>
            
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
                          Süre
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Oynanan Maç</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staticPlayers.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-8 text-muted-foreground">
                          Henüz istatistik bulunmuyor
                        </td>
                      </tr>
                    ) : (
                      staticPlayers.slice(0, 50).map((player, index) => (
                        <tr 
                          key={index} 
                          className="border-b hover-elevate"
                          data-testid={`row-top50-player-${index}`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground" data-testid={`text-top50-player-name-${index}`}>
                            {player.username}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {player.rank}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-foreground" data-testid={`text-top50-player-goals-${index}`}>
                            {player.goals}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-top50-player-assists-${index}`}>
                            {player.assists}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-top50-player-dm-${index}`}>
                            {player.dm}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-top50-player-cs-${index}`}>
                            {player.cs}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-top50-player-saves-${index}`}>
                            {player.saves}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-top50-player-playtime-${index}`}>
                            {formatTime(player.matchTime)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-foreground" data-testid={`text-top50-player-matches-${index}`}>
                            {player.matchesPlayed}
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

      <Footer />
    </div>
  );
}
