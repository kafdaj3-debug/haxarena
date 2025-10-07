import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminApplicationPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gameNick: "",
    discordNick: "",
    playDuration: "",
    activeServers: "",
    previousExperience: "",
    dailyHours: "",
    activeTimeZones: "",
    aboutYourself: "",
  });

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/settings"],
  });

  const { data: applications } = useQuery<any[]>({
    queryKey: ["/api/applications/admin"],
  });

  const { data: myApplications } = useQuery<any[]>({
    queryKey: ["/api/applications/admin/my"],
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/applications/admin", { ...data, userId: user!.id });
    },
    onSuccess: () => {
      toast({
        title: "Başvuru Gönderildi",
        description: "Başvurunuz yöneticilere iletildi",
      });
      setFormData({
        name: "",
        age: "",
        gameNick: "",
        discordNick: "",
        playDuration: "",
        activeServers: "",
        previousExperience: "",
        dailyHours: "",
        activeTimeZones: "",
        aboutYourself: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/admin/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/admin"] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Başvuru gönderilemedi",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate(formData);
  };

  const hasPendingApplication = myApplications?.some(app => app.status === "pending");
  const applicationsOpen = settings?.adminApplicationsOpen;

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Admin Başvurusu</h1>
            <p className="text-muted-foreground">HaxArena adminliği için başvurun</p>
          </div>

          <div className="grid gap-6">
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Yeni Başvuru</CardTitle>
                  <CardDescription>Başvuru formunu doldurun</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {!applicationsOpen && (
                      <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Admin başvuruları şu anda kapalı
                        </AlertDescription>
                      </Alert>
                    )}
                    {hasPendingApplication && (
                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Bekleyen bir başvurunuz var. Sonuçlandırılması bekleniyor.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">İsim</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={hasPendingApplication || !applicationsOpen}
                        data-testid="input-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Yaşınız?</Label>
                      <Input
                        id="age"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                        disabled={hasPendingApplication || !applicationsOpen}
                        data-testid="input-age"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gameNick">Oyunda Kullandığınız Nick</Label>
                      <Input
                        id="gameNick"
                        value={formData.gameNick}
                        onChange={(e) => setFormData({ ...formData, gameNick: e.target.value })}
                        required
                        disabled={hasPendingApplication || !applicationsOpen}
                        data-testid="input-game-nick"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discordNick">Discord Nickiniz</Label>
                      <Input
                        id="discordNick"
                        value={formData.discordNick}
                        onChange={(e) => setFormData({ ...formData, discordNick: e.target.value })}
                        required
                        disabled={hasPendingApplication || !applicationsOpen}
                        data-testid="input-discord-nick"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="playDuration">Ne Kadar Süredir Oynamaktasınız?</Label>
                      <Input
                        id="playDuration"
                        value={formData.playDuration}
                        onChange={(e) => setFormData({ ...formData, playDuration: e.target.value })}
                        required
                        disabled={hasPendingApplication || !applicationsOpen}
                        data-testid="input-play-duration"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activeServers">Hangi Sunucularda Aktif Oynadınız?</Label>
                      <Textarea
                        id="activeServers"
                        value={formData.activeServers}
                        onChange={(e) => setFormData({ ...formData, activeServers: e.target.value })}
                        required
                        rows={3}
                        disabled={hasPendingApplication || !applicationsOpen}
                        data-testid="textarea-active-servers"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previousExperience">
                        Daha Önce Yetkili Olduğunuz Sunucular/ Varsa Sunucudaki Rütbeniz-Göreviniz?
                      </Label>
                      <Textarea
                        id="previousExperience"
                        value={formData.previousExperience}
                        onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                        required
                        rows={3}
                        disabled={hasPendingApplication || !applicationsOpen}
                        data-testid="textarea-previous-experience"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dailyHours">Günde Kaç Saatinizi Ayırabilirsiniz?</Label>
                      <Input
                        id="dailyHours"
                        value={formData.dailyHours}
                        onChange={(e) => setFormData({ ...formData, dailyHours: e.target.value })}
                        required
                        disabled={hasPendingApplication || !applicationsOpen}
                        data-testid="input-daily-hours"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activeTimeZones">
                        Hangi zaman dilimlerinde aktif olabilirsiniz?
                      </Label>
                      <Textarea
                        id="activeTimeZones"
                        value={formData.activeTimeZones}
                        onChange={(e) => setFormData({ ...formData, activeTimeZones: e.target.value })}
                        required
                        rows={3}
                        disabled={hasPendingApplication || !applicationsOpen}
                        data-testid="textarea-active-time-zones"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aboutYourself">
                        Son olarak biraz kendinizden bahsedebilir misiniz?
                      </Label>
                      <Textarea
                        id="aboutYourself"
                        value={formData.aboutYourself}
                        onChange={(e) => setFormData({ ...formData, aboutYourself: e.target.value })}
                        required
                        rows={5}
                        disabled={hasPendingApplication || !applicationsOpen}
                        data-testid="textarea-about-yourself"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={applyMutation.isPending || hasPendingApplication || !applicationsOpen}
                      data-testid="button-submit"
                    >
                      {applyMutation.isPending ? "Gönderiliyor..." : "Başvur"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}

            {!user && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Başvuru yapmak için giriş yapmalısınız
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h2 className="text-2xl font-heading font-bold mb-4">Tüm Başvurular</h2>
              <div className="space-y-4">
                {applications?.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-lg">{app.user?.username || "Bilinmeyen"}</CardTitle>
                        <Badge variant={
                          app.status === "pending" ? "secondary" :
                          app.status === "approved" ? "default" : "destructive"
                        }>
                          {app.status === "pending" ? "Beklemede" :
                           app.status === "approved" ? "Onaylandı" : "Reddedildi"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-semibold text-sm">İsim:</p>
                        <p className="text-sm text-muted-foreground">{app.name}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Yaş:</p>
                        <p className="text-sm text-muted-foreground">{app.age}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Oyun Nicki:</p>
                        <p className="text-sm text-muted-foreground">{app.gameNick}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Discord Nicki:</p>
                        <p className="text-sm text-muted-foreground">{app.discordNick}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Oyun Süresi:</p>
                        <p className="text-sm text-muted-foreground">{app.playDuration}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Aktif Sunucular:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.activeServers}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Önceki Deneyim:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.previousExperience}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Günlük Saat:</p>
                        <p className="text-sm text-muted-foreground">{app.dailyHours}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Aktif Saatler:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.activeTimeZones}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Hakkında:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.aboutYourself}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {applications?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Henüz başvuru yok</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
