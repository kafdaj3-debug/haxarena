import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <Card className="p-6 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 relative overflow-hidden shadow-2xl border-0 backdrop-blur-sm">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-500/20 to-teal-600/20 animate-pulse"></div>
        
        {/* Animated grass texture overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.1) 2px,
              rgba(255,255,255,0.1) 4px
            )`,
          }}></div>
        </div>

        {/* Field background pattern with better visibility and animations */}
        <div className="absolute inset-0 opacity-30">
          {/* Center line with animation */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/90 shadow-lg animate-pulse"></div>
          
          {/* Center circle with glow effect */}
          <div className="absolute top-1/2 left-1/2 w-40 h-40 border-[3px] border-white/90 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/90 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse"></div>
          
          {/* Penalty boxes with glow */}
          <div className="absolute top-0 left-0 w-32 h-40 border-[3px] border-white/90 border-r-0 shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
          <div className="absolute top-0 right-0 w-32 h-40 border-[3px] border-white/90 border-l-0 shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
          <div className="absolute bottom-0 left-0 w-32 h-40 border-[3px] border-white/90 border-r-0 border-t-0 shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
          <div className="absolute bottom-0 right-0 w-32 h-40 border-[3px] border-white/90 border-l-0 border-t-0 shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
        </div>

        {/* Field container */}
        <div className="relative aspect-[3/2] min-h-[450px]">
          {/* Player positions */}
          {Object.entries(POSITIONS).map(([position, coords], index) => {
            const player = getPlayerAtPosition(position);
            const teamLogo = player ? getTeamLogo(player.teamId) : null;
            
            return (
              <div
                key={position}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
                style={{ 
                  top: coords.top, 
                  left: coords.left,
                  animation: mounted ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none'
                }}
              >
                <div
                  className={`relative flex flex-col items-center group ${
                    editable && !player ? "cursor-pointer" : ""
                  }`}
                  onClick={() => editable && onPlayerClick && onPlayerClick(position)}
                >
                  {/* Glow effect behind player circle */}
                  {player && (
                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-blue-400/30 blur-xl animate-pulse -z-10"></div>
                  )}
                  
                  {/* Player circle with enhanced animations */}
                  <div className={`relative w-20 h-20 rounded-full border-[3px] flex items-center justify-center transition-all duration-500 ${
                    player 
                      ? "bg-gradient-to-br from-white to-blue-50 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] scale-100 hover:scale-125 hover:shadow-[0_0_35px_rgba(59,130,246,0.8)] hover:border-blue-400 group-hover:rotate-3" 
                      : editable 
                        ? "bg-white/30 border-white/70 border-dashed hover:bg-white/60 hover:scale-125 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" 
                        : "bg-white/20 border-white/40"
                  }`}>
                    {player ? (
                      <>
                        {/* Team logo with enhanced styling */}
                        {teamLogo && (
                          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full border-[3px] border-white bg-gradient-to-br from-white to-gray-50 shadow-[0_4px_15px_rgba(0,0,0,0.3)] z-20 flex items-center justify-center p-1.5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                            <img 
                              src={teamLogo} 
                              alt={player.teamName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        {/* Player number with gradient text */}
                        <span className="text-2xl font-black bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
                          {player.playerNumber}
                        </span>
                        {/* Shine effect on number */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : editable ? (
                      <span className="text-white text-3xl font-bold drop-shadow-lg">+</span>
                    ) : null}
                  </div>
                  
                  {/* Player name card with enhanced styling */}
                  {player && (
                    <div className="mt-3 px-4 py-2 bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 backdrop-blur-md rounded-xl text-white text-xs font-bold text-center min-w-[120px] shadow-[0_8px_25px_rgba(0,0,0,0.5)] border border-white/30 group-hover:border-white/50 transition-all duration-300 group-hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)] group-hover:scale-105">
                      <div className="font-extrabold truncate text-sm mb-1 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        {player.playerName}
                      </div>
                      {teamLogo && (
                        <div className="flex items-center justify-center gap-1.5 mt-1.5 pt-1.5 border-t border-white/20 text-[10px] text-white/90">
                          <img 
                            src={teamLogo} 
                            alt={player.teamName}
                            className="w-4 h-4 object-contain drop-shadow-md"
                          />
                          <span className="truncate font-semibold">{player.teamName}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Position label with enhanced styling */}
                  {!player && editable && (
                    <div className="mt-3 px-3 py-1.5 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-lg text-white text-xs font-bold border border-white/40 shadow-lg hover:bg-white/40 hover:border-white/60 transition-all duration-300">
                      {position}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* CSS Animations */}
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) translateY(20px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) translateY(0);
            }
          }
        `}</style>
      </Card>
    </div>
  );
}

