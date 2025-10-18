import { useState } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Shield, Clock, Crosshair, Award, TrendingUp, User } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";

interface PlayerDetailData {
  id: string;
  username: string;
  rank: string;
  goals: number;
  assists: number;
  saves: number;
  matchTime: number;
  wins: number;
  losses: number;
  draws: number;
  matchesPlayed: number;
  points: number;
  ranking: number;
  totalPlayers: number;
}

// Test verileri (gerçek database yerine)
const testPlayerData: Record<string, PlayerDetailData> = {
  "Oyuncu1": {
    id: "1",
    username: "Oyuncu1",
    rank: "Elmas",
    goals: 245,
    assists: 180,
    saves: 95,
    matchTime: 864000,
    wins: 280,
    losses: 100,
    draws: 40,
    matchesPlayed: 420,
    points: 1120,
    ranking: 1,
    totalPlayers: 10
  },
  "Oyuncu2": {
    id: "2",
    username: "Oyuncu2",
    rank: "Platin",
    goals: 198,
    assists: 165,
    saves: 88,
    matchTime: 720000,
    wins: 220,
    losses: 120,
    draws: 40,
    matchesPlayed: 380,
    points: 920,
    ranking: 2,
    totalPlayers: 10
  },
  "Oyuncu3": {
    id: "3",
    username: "Oyuncu3",
    rank: "Altın",
    goals: 175,
    assists: 145,
    saves: 82,
    matchTime: 648000,
    wins: 200,
    losses: 110,
    draws: 40,
    matchesPlayed: 350,
    points: 840,
    ranking: 3,
    totalPlayers: 10
  }
};

// Varsayılan test verisi (oyuncu bulunamazsa)
const defaultPlayerData: PlayerDetailData = {
  id: "default",
  username: "Test Oyuncu",
  rank: "Bronz",
  goals: 50,
  assists: 35,
  saves: 20,
  matchTime: 144000,
  wins: 40,
  losses: 30,
  draws: 10,
  matchesPlayed: 80,
  points: 170,
  ranking: 5,
  totalPlayers: 10
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  const RADIAN = Math.PI / 180;
  const midAngle = (startAngle + endAngle) / 2;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const textX = cx + (outerRadius + 20) * cos;
  const textY = cy + (outerRadius + 20) * sin;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={fill}
      />
      <text 
        x={textX} 
        y={textY} 
        fill="#e5e5e5" 
        textAnchor={cos >= 0 ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="16"
        fontWeight="700"
      >
        %{payload.percentage}
      </text>
    </g>
  );
};

export default function PlayerDetailPage() {
  const { username } = useParams();
  const { user, logout } = useAuth();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Test verileri kullan (gerçek database yerine)
  const player = username && testPlayerData[username] 
    ? testPlayerData[username] 
    : defaultPlayerData;
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

  // Calculate percentages
  const totalMatches = player?.matchesPlayed || 0;
  const winPercentage = totalMatches > 0 ? ((player?.wins || 0) / totalMatches * 100).toFixed(1) : '0.0';
  const lossPercentage = totalMatches > 0 ? ((player?.losses || 0) / totalMatches * 100).toFixed(1) : '0.0';
  const drawPercentage = totalMatches > 0 ? ((player?.draws || 0) / totalMatches * 100).toFixed(1) : '0.0';

  // Prepare pie chart data
  const pieChartData = [
    { 
      name: 'Galibiyet', 
      value: player?.wins || 0, 
      percentage: winPercentage,
      color: '#22c55e' // green-500
    },
    { 
      name: 'Yenilgi', 
      value: player?.losses || 0, 
      percentage: lossPercentage,
      color: '#ef4444' // red-500
    },
    { 
      name: 'Beraberlik', 
      value: player?.draws || 0, 
      percentage: drawPercentage,
      color: '#eab308' // yellow-500
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Player Header */}
          <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl" data-testid="text-player-username">{player.username}</CardTitle>
                        <p className="text-muted-foreground" data-testid="text-player-rank">{player.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Sıralama</p>
                      <p className="text-2xl font-bold" data-testid="text-player-ranking">
                        {player.ranking}. / {player.totalPlayers}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-lg">Puan: </span>
                    <span className="text-2xl font-bold text-primary" data-testid="text-player-points">{player.points}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Match Statistics */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Maç İstatistikleri</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Maç</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold" data-testid="text-matches-played">{player.matchesPlayed}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-green-500" />
                          Galibiyet
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-500" data-testid="text-wins">{player.wins}</p>
                        <p className="text-sm text-muted-foreground">%{winPercentage}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Target className="w-4 h-4 text-red-500" />
                          Yenilgi
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-red-500" data-testid="text-losses">{player.losses}</p>
                        <p className="text-sm text-muted-foreground">%{lossPercentage}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          Beraberlik
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-yellow-500" data-testid="text-draws">{player.draws}</p>
                        <p className="text-sm text-muted-foreground">%{drawPercentage}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 3D Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Maç Oranları</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            startAngle={0}
                            endAngle={360}
                            innerRadius={0}
                            outerRadius={95}
                            paddingAngle={0}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                            label={false}
                            labelLine={false}
                            blendStroke
                            style={{ cursor: 'pointer' }}
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(undefined)}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                stroke={entry.color}
                              />
                            ))}
                          </Pie>
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value: string) => <span className="text-sm" style={{ color: '#e5e5e5' }}>{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Performance Statistics */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Performans İstatistikleri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        ⚽ Goller
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" data-testid="text-goals">{player.goals}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        🎯 Asistler
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" data-testid="text-assists">{player.assists}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        🧤 Kurtarışlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" data-testid="text-saves">{player.saves}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        ⏱️ Oyun Süresi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold" data-testid="text-match-time">{formatTime(player.matchTime)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        🛡️ DM
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" data-testid="text-dm">0</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        🥅 CS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" data-testid="text-cs">0</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
