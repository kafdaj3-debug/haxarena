import LeagueStandingsTable from '../LeagueStandingsTable'

export default function LeagueStandingsTableExample() {
  const mockStandings = [
    {
      rank: 1,
      teamName: "Galatasaray Espor",
      played: 10,
      won: 8,
      drawn: 1,
      lost: 1,
      goalsFor: 32,
      goalsAgainst: 12,
      goalDifference: 20,
      points: 25
    },
    {
      rank: 2,
      teamName: "Fenerbahçe SK",
      played: 10,
      won: 7,
      drawn: 2,
      lost: 1,
      goalsFor: 28,
      goalsAgainst: 14,
      goalDifference: 14,
      points: 23
    },
    {
      rank: 3,
      teamName: "Beşiktaş JK",
      played: 10,
      won: 6,
      drawn: 2,
      lost: 2,
      goalsFor: 24,
      goalsAgainst: 16,
      goalDifference: 8,
      points: 20
    },
    {
      rank: 4,
      teamName: "Trabzonspor",
      played: 10,
      won: 4,
      drawn: 3,
      lost: 3,
      goalsFor: 18,
      goalsAgainst: 18,
      goalDifference: 0,
      points: 15
    }
  ];

  return <LeagueStandingsTable standings={mockStandings} />
}
