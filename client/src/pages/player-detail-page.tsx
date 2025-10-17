import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Shield, Clock, Crosshair, Award, TrendingUp, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

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
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth={2}
      />
    </g>
  );
};

export default function PlayerDetailPage() {
  const { username } = useParams();
  const { user, logout } = useAuth();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const { data: player, isLoading } = useQuery<PlayerDetailData>({
    queryKey: ['/api/players', username],
    queryFn: async () => {
      const response = await fetch(`/api/players/${username}`);
      if (!response.ok) {
        throw new Error('Oyuncu bulunamadı');
      }
      return response.json();
    },
    enabled: !!username,
  });

  // Format seconds to Turkish time format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} saat ${minutes} dakika`;
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
      color: '#86efac' // green-300 (light)
    },
    { 
      name: 'Yenilgi', 
      value: player?.losses || 0, 
      percentage: lossPercentage,
      color: '#fca5a5' // red-300 (light)
    },
    { 
      name: 'Beraberlik', 
      value: player?.draws || 0, 
      percentage: drawPercentage,
      color: '#fde047' // yellow-300 (light)
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            </div>
          ) : player ? (
            <>
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
                          <defs>
                            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                              <feOffset dx="0" dy="4" result="offsetblur"/>
                              <feComponentTransfer>
                                <feFuncA type="linear" slope="0.5"/>
                              </feComponentTransfer>
                              <feMerge>
                                <feMergeNode/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="45%"
                            startAngle={0}
                            endAngle={360}
                            innerRadius={0}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1000}
                            label={{
                              position: 'inside',
                              fill: '#ffffff',
                              fontSize: 14,
                              fontWeight: 600,
                              formatter: (value: any, entry: any) => `%${entry.percentage}`
                            }}
                            labelLine={false}
                            style={{ filter: 'url(#shadow)', cursor: 'pointer' }}
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(undefined)}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                strokeWidth={2} 
                                stroke="rgba(255, 255, 255, 0.3)"
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: '#fff',
                              padding: '8px 12px'
                            }}
                            formatter={(value: number, name: string, props: any) => [
                              `${value} maç (%${props.payload.percentage})`,
                              name
                            ]}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value: string) => <span className="text-sm text-foreground">{value}</span>}
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
                        <Trophy className="w-4 h-4 text-primary" />
                        Goller
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" data-testid="text-goals">{player.goals}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Asistler
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" data-testid="text-assists">{player.assists}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Kurtarışlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" data-testid="text-saves">{player.saves}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Oyun Süresi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold" data-testid="text-match-time">{formatTime(player.matchTime)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Crosshair className="w-4 h-4 text-primary" />
                        DM
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" data-testid="text-dm">0</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        CS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" data-testid="text-cs">0</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Oyuncu bulunamadı</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
