import { Card } from "@/components/ui/card";

interface Player {
  position: string;
  playerNumber: number;
  playerName: string;
  teamId: string;
  teamName: string;
  teamLogo: string | null;
}

interface FormationViewProps {
  players: Player[];
  teams: Array<{ id: string; name: string; logo: string | null }>;
  onPlayerClick?: (position: string) => void;
  editable?: boolean;
}

// Position coordinates on the field (percentage-based) - 6 players formation
// Based on image: 1 (GK), 3 (RB), 6 (LB), 8 (CM), 9 (RW), 10 (LW)
const POSITIONS: Record<string, { top: string; left: string }> = {
  "1": { top: "88%", left: "50%" },      // Goalkeeper (1)
  "3": { top: "70%", left: "75%" },      // Right Back (3)
  "6": { top: "70%", left: "25%" },      // Left Back (6)
  "8": { top: "50%", left: "50%" },      // Center Midfielder (8)
  "9": { top: "25%", left: "75%" },      // Right Wing (9)
  "10": { top: "25%", left: "25%" },     // Left Wing (10)
};

export default function FormationView({ players, teams, onPlayerClick, editable = false }: FormationViewProps) {
  const getPlayerAtPosition = (position: string): Player | undefined => {
    return players.find(p => p.position === position);
  };

  const getTeamLogo = (teamId: string): string | null => {
    if (!teams || teams.length === 0) return null;
    const team = teams.find(t => t.id === teamId);
    return team?.logo || null;
  };

  return (
    <div className="w-full">
      <Card className="p-4 bg-gradient-to-b from-green-600 to-green-800 relative overflow-hidden">
        {/* Field background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 left-0 w-24 h-32 border-2 border-white border-r-0"></div>
          <div className="absolute top-0 right-0 w-24 h-32 border-2 border-white border-l-0"></div>
          <div className="absolute bottom-0 left-0 w-24 h-32 border-2 border-white border-r-0 border-t-0"></div>
          <div className="absolute bottom-0 right-0 w-24 h-32 border-2 border-white border-l-0 border-t-0"></div>
        </div>

        {/* Field container */}
        <div className="relative aspect-[3/2] min-h-[400px]">
          {/* Player positions */}
          {Object.entries(POSITIONS).map(([position, coords]) => {
            const player = getPlayerAtPosition(position);
            const teamLogo = player ? getTeamLogo(player.teamId) : null;
            
            return (
              <div
                key={position}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: coords.top, left: coords.left }}
              >
                <div
                  className={`relative flex flex-col items-center ${
                    editable && !player ? "cursor-pointer hover:scale-110 transition-transform" : ""
                  }`}
                  onClick={() => editable && onPlayerClick && onPlayerClick(position)}
                >
                  {/* Player circle */}
                  <div className={`relative w-16 h-16 rounded-full border-2 flex items-center justify-center ${
                    player 
                      ? "bg-white border-blue-500 shadow-lg" 
                      : editable 
                        ? "bg-white/20 border-white/50 border-dashed" 
                        : "bg-white/10 border-white/30"
                  }`}>
                    {player ? (
                      <>
                        {teamLogo && (
                          <img 
                            src={teamLogo} 
                            alt={player.teamName}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white bg-white object-contain z-10"
                          />
                        )}
                        <span className="text-lg font-bold text-gray-900">{player.playerNumber}</span>
                      </>
                    ) : editable ? (
                      <span className="text-white/50 text-xs">+</span>
                    ) : null}
                  </div>
                  
                  {/* Player name */}
                  {player && (
                    <div className="mt-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs font-medium text-center max-w-[80px] truncate">
                      {player.playerName}
                    </div>
                  )}
                  
                  {/* Position label (only when no player) */}
                  {!player && editable && (
                    <div className="mt-1 text-white/50 text-xs font-medium">
                      {position}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

