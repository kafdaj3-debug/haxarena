import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamStanding {
  rank: number;
  teamName: string;
  logoUrl?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface LeagueStandingsTableProps {
  standings: TeamStanding[];
}

export default function LeagueStandingsTable({ standings }: LeagueStandingsTableProps) {
  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" data-testid="header-rank">#</TableHead>
            <TableHead data-testid="header-team">Takım</TableHead>
            <TableHead className="text-center" data-testid="header-played">O</TableHead>
            <TableHead className="text-center" data-testid="header-won">G</TableHead>
            <TableHead className="text-center" data-testid="header-drawn">B</TableHead>
            <TableHead className="text-center" data-testid="header-lost">M</TableHead>
            <TableHead className="text-center" data-testid="header-gf">A</TableHead>
            <TableHead className="text-center" data-testid="header-ga">Y</TableHead>
            <TableHead className="text-center" data-testid="header-gd">AV</TableHead>
            <TableHead className="text-center font-bold" data-testid="header-points">P</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((team) => (
            <TableRow key={team.rank} data-testid={`row-team-${team.rank}`}>
              <TableCell className="font-medium" data-testid={`text-rank-${team.rank}`}>
                {team.rank}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    {team.logoUrl && <AvatarImage src={team.logoUrl} alt={team.teamName} />}
                    <AvatarFallback>{team.teamName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium" data-testid={`text-team-${team.rank}`}>
                    {team.teamName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center" data-testid={`text-played-${team.rank}`}>{team.played}</TableCell>
              <TableCell className="text-center" data-testid={`text-won-${team.rank}`}>{team.won}</TableCell>
              <TableCell className="text-center" data-testid={`text-drawn-${team.rank}`}>{team.drawn}</TableCell>
              <TableCell className="text-center" data-testid={`text-lost-${team.rank}`}>{team.lost}</TableCell>
              <TableCell className="text-center" data-testid={`text-gf-${team.rank}`}>{team.goalsFor}</TableCell>
              <TableCell className="text-center" data-testid={`text-ga-${team.rank}`}>{team.goalsAgainst}</TableCell>
              <TableCell className={`text-center font-medium ${team.goalDifference > 0 ? 'text-green-500' : team.goalDifference < 0 ? 'text-red-500' : ''}`} data-testid={`text-gd-${team.rank}`}>
                {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
              </TableCell>
              <TableCell className="text-center font-bold text-primary" data-testid={`text-points-${team.rank}`}>
                {team.points}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
