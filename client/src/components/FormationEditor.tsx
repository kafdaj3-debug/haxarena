import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import FormationView from "./FormationView";

interface Player {
  position: string;
  playerNumber: number;
  playerName: string;
  teamId: string;
  teamName: string;
  teamLogo: string | null;
}

interface FormationEditorProps {
  teams: Array<{ id: string; name: string; logo: string | null }>;
  initialPlayers?: Player[];
  onSave: (players: Player[]) => void;
  onCancel?: () => void;
}

const POSITION_NAMES: Record<string, string> = {
  "1": "Kaleci (1)",
  "3": "Sağ Bek (3)",
  "6": "Sol Bek (6)",
  "8": "Orta Saha (8)",
  "9": "Sağ Kanat (9)",
  "10": "Sol Kanat (10)",
};

export default function FormationEditor({ teams, initialPlayers = [], onSave, onCancel }: FormationEditorProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const handlePositionClick = (position: string) => {
    const existingPlayer = players.find(p => p.position === position);
    if (existingPlayer) {
      // Remove player
      setPlayers(players.filter(p => p.position !== position));
    } else {
      // Add new player
      setEditingPosition(position);
      setPlayerName("");
      setSelectedTeamId("");
    }
  };

  const handleSavePlayer = () => {
    if (!editingPosition || !playerName.trim() || !selectedTeamId) {
      return;
    }

    const team = teams.find(t => t.id === selectedTeamId);
    if (!team) return;

    // Position number is the same as position key (1, 3, 6, 8, 9, 10)
    const newPlayer: Player = {
      position: editingPosition,
      playerNumber: parseInt(editingPosition) || 0,
      playerName: playerName.trim(),
      teamId: selectedTeamId,
      teamName: team.name,
      teamLogo: team.logo,
    };

    setPlayers([...players.filter(p => p.position !== editingPosition), newPlayer]);
    setEditingPosition(null);
    setPlayerName("");
    setSelectedTeamId("");
  };

  const handleRemovePlayer = (position: string) => {
    setPlayers(players.filter(p => p.position !== position));
  };

  const handleSave = () => {
    onSave(players);
  };

  return (
    <div className="space-y-4">
      <FormationView 
        players={players} 
        teams={teams} 
        onPlayerClick={handlePositionClick}
        editable={true}
      />

      {/* Player editing form */}
      {editingPosition && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Oyuncu Ekle - {POSITION_NAMES[editingPosition] || editingPosition}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingPosition(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pozisyon Numarası</Label>
              <Input
                type="text"
                value={POSITION_NAMES[editingPosition] || editingPosition}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Oyuncu Adı</Label>
              <Input
                placeholder="Oyuncu adı"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Takım</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Takım seçin" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center gap-2">
                        {team.logo && (
                          <img 
                            src={team.logo} 
                            alt={team.name}
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span>{team.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSavePlayer} className="flex-1">
                Ekle
              </Button>
              <Button variant="outline" onClick={() => setEditingPosition(null)}>
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current players list */}
      {players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Eklenen Oyuncular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players.map((player) => (
                <div 
                  key={player.position}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center">
                      <span className="font-bold text-sm">{player.playerNumber}</span>
                    </div>
                    {player.teamLogo && (
                      <img 
                        src={player.teamLogo} 
                        alt={player.teamName}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <div>
                      <div className="font-medium">{player.playerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {POSITION_NAMES[player.position] || player.position} - {player.teamName}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePlayer(player.position)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save/Cancel buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1" disabled={players.length === 0}>
          Dizilimi Kaydet
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            İptal
          </Button>
        )}
      </div>
    </div>
  );
}

