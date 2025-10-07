import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";

interface PlayerStat {
  rank: number;
  playerName: string;
  value: number;
}

interface StatsLeaderboardProps {
  title: string;
  stats: PlayerStat[];
  icon?: React.ReactNode;
}

export default function StatsLeaderboard({ title, stats, icon }: StatsLeaderboardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-700";
    return "text-muted-foreground";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={`w-4 h-4 ${getRankColor(rank)}`} />;
    }
    return <Medal className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span data-testid="text-leaderboard-title">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.map((stat) => (
            <div
              key={stat.rank}
              className="flex items-center justify-between p-2 rounded-lg hover-elevate"
              data-testid={`row-stat-${stat.rank}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getRankIcon(stat.rank)}
                  <span className={`font-mono text-sm ${getRankColor(stat.rank)}`} data-testid={`text-rank-${stat.rank}`}>
                    #{stat.rank}
                  </span>
                </div>
                <span className="font-medium truncate" data-testid={`text-player-${stat.rank}`}>
                  {stat.playerName}
                </span>
              </div>
              <span className="font-bold text-primary" data-testid={`text-value-${stat.rank}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
