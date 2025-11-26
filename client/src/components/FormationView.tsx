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
      <Card className="p-6 bg-gradient-to-br from-green-500 via-green-600 to-green-700 relative overflow-hidden shadow-2xl border-0">
        {/* Field background pattern with better visibility */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/80"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 border-[3px] border-white/80 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 left-0 w-32 h-40 border-[3px] border-white/80 border-r-0"></div>
          <div className="absolute top-0 right-0 w-32 h-40 border-[3px] border-white/80 border-l-0"></div>
          <div className="absolute bottom-0 left-0 w-32 h-40 border-[3px] border-white/80 border-r-0 border-t-0"></div>
          <div className="absolute bottom-0 right-0 w-32 h-40 border-[3px] border-white/80 border-l-0 border-t-0"></div>
        </div>

        {/* Field container */}
        <div className="relative aspect-[3/2] min-h-[450px]">
          {/* Player positions */}
          {Object.entries(POSITIONS).map(([position, coords]) => {
            const player = getPlayerAtPosition(position);
            const teamLogo = player ? getTeamLogo(player.teamId) : null;
            
            return (
              <div
                key={position}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{ top: coords.top, left: coords.left }}
              >
                <div
                  className={`relative flex flex-col items-center group ${
                    editable && !player ? "cursor-pointer" : ""
                  }`}
                  onClick={() => editable && onPlayerClick && onPlayerClick(position)}
                >
                  {/* Player circle with animations */}
                  <div className={`relative w-20 h-20 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 ${
                    player 
                      ? "bg-white border-blue-600 shadow-2xl scale-100 hover:scale-110 group-hover:shadow-blue-500/50" 
                      : editable 
                        ? "bg-white/30 border-white/70 border-dashed hover:bg-white/50 hover:scale-110" 
                        : "bg-white/20 border-white/40"
                  }`}>
                    {player ? (
                      <>
                        {/* Team logo - larger and more prominent */}
                        {teamLogo && (
                          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full border-[3px] border-white bg-white shadow-lg z-20 flex items-center justify-center p-1 group-hover:scale-125 transition-transform duration-300">
                            <img 
                              src={teamLogo} 
                              alt={player.teamName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <span className="text-xl font-extrabold text-gray-900 drop-shadow-sm">{player.playerNumber}</span>
                      </>
                    ) : editable ? (
                      <span className="text-white text-2xl font-bold">+</span>
                    ) : null}
                  </div>
                  
                  {/* Player name with team info */}
                  {player && (
                    <div className="mt-2 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg text-white text-xs font-semibold text-center min-w-[100px] shadow-lg border border-white/20">
                      <div className="font-bold truncate">{player.playerName}</div>
                      {teamLogo && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-white/80">
                          <img 
                            src={teamLogo} 
                            alt={player.teamName}
                            className="w-3 h-3 object-contain"
                          />
                          <span className="truncate">{player.teamName}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Position label (only when no player) */}
                  {!player && editable && (
                    <div className="mt-2 px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-xs font-medium border border-white/30">
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

