import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeagueStandingsTable from "@/components/LeagueStandingsTable";
import StatsLeaderboard from "@/components/StatsLeaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Users, Shield, Award, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function LeaguePage() {
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

  const goalScorers = [
    { rank: 1, playerName: "Mehmet_07", value: 45 },
    { rank: 2, playerName: "Emre_10", value: 38 },
    { rank: 3, playerName: "Ali_9", value: 32 },
    { rank: 4, playerName: "Can_11", value: 28 },
    { rank: 5, playerName: "Burak_17", value: 24 },
    { rank: 6, playerName: "Arda_14", value: 21 },
    { rank: 7, playerName: "Kerem_7", value: 19 },
    { rank: 8, playerName: "Ozgur_8", value: 17 },
    { rank: 9, playerName: "Serkan_21", value: 15 },
    { rank: 10, playerName: "Murat_19", value: 14 }
  ];

  const assistLeaders = [
    { rank: 1, playerName: "Ozgur_8", value: 32 },
    { rank: 2, playerName: "Arda_14", value: 28 },
    { rank: 3, playerName: "Kerem_7", value: 25 },
    { rank: 4, playerName: "Hakan_10", value: 22 },
    { rank: 5, playerName: "Cengiz_11", value: 19 },
    { rank: 6, playerName: "Yunus_18", value: 17 },
    { rank: 7, playerName: "Baris_6", value: 15 },
    { rank: 8, playerName: "Emre_10", value: 14 },
    { rank: 9, playerName: "Taha_23", value: 13 },
    { rank: 10, playerName: "Furkan_9", value: 12 }
  ];

  const saveLeaders = [
    { rank: 1, playerName: "Mert_GK", value: 156 },
    { rank: 2, playerName: "Volkan_1", value: 142 },
    { rank: 3, playerName: "Ugurcan_23", value: 138 },
    { rank: 4, playerName: "Altay_12", value: 125 },
    { rank: 5, playerName: "Berke_30", value: 118 },
    { rank: 6, playerName: "Ersin_34", value: 112 },
    { rank: 7, playerName: "Harun_16", value: 105 },
    { rank: 8, playerName: "Gokhan_25", value: 98 },
    { rank: 9, playerName: "Kaan_13", value: 92 },
    { rank: 10, playerName: "Ertugrul_1", value: 87 }
  ];

  const csLeaders = [
    { rank: 1, playerName: "Mert_GK", value: 12 },
    { rank: 2, playerName: "Volkan_1", value: 10 },
    { rank: 3, playerName: "Ugurcan_23", value: 9 },
    { rank: 4, playerName: "Altay_12", value: 8 },
    { rank: 5, playerName: "Berke_30", value: 7 },
    { rank: 6, playerName: "Ersin_34", value: 6 },
    { rank: 7, playerName: "Harun_16", value: 6 },
    { rank: 8, playerName: "Gokhan_25", value: 5 },
    { rank: 9, playerName: "Kaan_13", value: 4 },
    { rank: 10, playerName: "Ertugrul_1", value: 4 }
  ];

  const dmLeaders = [
    { rank: 1, playerName: "Serdar_5", value: 245 },
    { rank: 2, playerName: "Ozan_4", value: 232 },
    { rank: 3, playerName: "Merih_3", value: 218 },
    { rank: 4, playerName: "Caglar_2", value: 205 },
    { rank: 5, playerName: "Kaan_15", value: 198 },
    { rank: 6, playerName: "Ahmet_24", value: 185 },
    { rank: 7, playerName: "Ridvan_20", value: 172 },
    { rank: 8, playerName: "Zeki_22", value: 165 },
    { rank: 9, playerName: "Samet_26", value: 158 },
    { rank: 10, playerName: "Ferdi_28", value: 151 }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-4" data-testid="text-page-title">
              Aktif Lig
            </h1>
            <Alert className="mb-6">
              <Info className="w-4 h-4" />
              <AlertDescription data-testid="text-league-info">
                Şu anda aktif bir lig sezonumuz bulunmamaktadır. Yeni sezon duyuruları için Discord kanalımızı takip edin.
              </AlertDescription>
            </Alert>
          </div>

          <Tabs defaultValue="standings" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="standings" data-testid="tab-standings">Puan Durumu</TabsTrigger>
              <TabsTrigger value="goals" data-testid="tab-goals">Gol Krallığı</TabsTrigger>
              <TabsTrigger value="assists" data-testid="tab-assists">Asist Krallığı</TabsTrigger>
              <TabsTrigger value="saves" data-testid="tab-saves">Kurtarış</TabsTrigger>
              <TabsTrigger value="cs" data-testid="tab-cs">CS Krallığı</TabsTrigger>
              <TabsTrigger value="dm" data-testid="tab-dm">DM Sıralaması</TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-4">Puan Durumu</h2>
                <LeagueStandingsTable standings={mockStandings} />
              </div>
            </TabsContent>

            <TabsContent value="goals">
              <StatsLeaderboard
                title="Gol Kralları - Top 10"
                stats={goalScorers}
                icon={<Target className="w-5 h-5 text-primary" />}
              />
            </TabsContent>

            <TabsContent value="assists">
              <StatsLeaderboard
                title="Asist Kralları - Top 10"
                stats={assistLeaders}
                icon={<Users className="w-5 h-5 text-primary" />}
              />
            </TabsContent>

            <TabsContent value="saves">
              <StatsLeaderboard
                title="Kurtarış Liderleri - Top 10"
                stats={saveLeaders}
                icon={<Shield className="w-5 h-5 text-primary" />}
              />
            </TabsContent>

            <TabsContent value="cs">
              <StatsLeaderboard
                title="Clean Sheet Kralları - Top 10"
                stats={csLeaders}
                icon={<Award className="w-5 h-5 text-primary" />}
              />
            </TabsContent>

            <TabsContent value="dm">
              <StatsLeaderboard
                title="Defans Müdahalesi Sıralaması - Top 10"
                stats={dmLeaders}
                icon={<TrendingUp className="w-5 h-5 text-primary" />}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer onlineCount={42} />
    </div>
  );
}
