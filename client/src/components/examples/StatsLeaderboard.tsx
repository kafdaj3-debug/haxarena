import StatsLeaderboard from '../StatsLeaderboard'
import { Target, Users, Shield } from 'lucide-react'

export default function StatsLeaderboardExample() {
  const goalScorers = [
    { rank: 1, playerName: "Mehmet_07", value: 45 },
    { rank: 2, playerName: "Emre_10", value: 38 },
    { rank: 3, playerName: "Ali_9", value: 32 },
    { rank: 4, playerName: "Can_11", value: 28 },
    { rank: 5, playerName: "Burak_17", value: 24 }
  ];

  const assistLeaders = [
    { rank: 1, playerName: "Ozgur_8", value: 32 },
    { rank: 2, playerName: "Arda_14", value: 28 },
    { rank: 3, playerName: "Kerem_7", value: 25 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
      <StatsLeaderboard
        title="Gol Kralları"
        stats={goalScorers}
        icon={<Target className="w-5 h-5 text-primary" />}
      />
      <StatsLeaderboard
        title="Asist Kralları"
        stats={assistLeaders}
        icon={<Users className="w-5 h-5 text-primary" />}
      />
      <StatsLeaderboard
        title="Kurtarış Liderleri"
        stats={[
          { rank: 1, playerName: "Mert_GK", value: 156 },
          { rank: 2, playerName: "Volkan_1", value: 142 },
          { rank: 3, playerName: "Ugurcan_23", value: 138 }
        ]}
        icon={<Shield className="w-5 h-5 text-primary" />}
      />
    </div>
  )
}
