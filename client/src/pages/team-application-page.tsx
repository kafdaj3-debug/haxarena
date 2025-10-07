import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TeamApplicationPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [teamName, setTeamName] = useState("");
  const [teamLogo, setTeamLogo] = useState("");
  const [description, setDescription] = useState("");

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/settings"],
  });

  const { data: applications } = useQuery<any[]>({
    queryKey: ["/api/applications/team"],
  });

  const applyMutation = useMutation({
    mutationFn: async (data: { teamName: string; teamLogo: string; description: string }) => {
      return await apiRequest("POST", "/api/applications/team", data);
    },
    onSuccess: () => {
      toast({
        title: "Başvuru Gönderildi",
        description: "Takım başvurunuz gönderildi",
      });
      setTeamName("");
      setTeamLogo("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/applications/team"] });
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
    applyMutation.mutate({ teamName, teamLogo, description });
  };

  const applicationsOpen = settings?.teamApplicationsOpen;

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Takım Başvurusu</h1>
            <p className="text-muted-foreground">Lige katılmak için takım başvurusu yapın</p>
          </div>

          <div className="grid gap-6">
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Yeni Takım Başvurusu</CardTitle>
                  <CardDescription>Takım bilgilerinizi girin</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {!applicationsOpen && (
                      <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Takım başvuruları şu anda kapalı
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Takım Adı</Label>
                      <Input
                        id="team-name"
                        type="text"
                        placeholder="Takım adınız"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                        disabled={!applicationsOpen}
                        data-testid="input-team-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team-logo">Takım Logosu URL (Opsiyonel)</Label>
                      <Input
                        id="team-logo"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={teamLogo}
                        onChange={(e) => setTeamLogo(e.target.value)}
                        disabled={!applicationsOpen}
                        data-testid="input-team-logo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Açıklama</Label>
                      <Textarea
                        id="description"
                        placeholder="Takımınız hakkında bilgi verin"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={5}
                        disabled={!applicationsOpen}
                        data-testid="textarea-description"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={applyMutation.isPending || !applicationsOpen}
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
                        <CardTitle className="text-lg">{app.teamName}</CardTitle>
                        <Badge variant={
                          app.status === "pending" ? "secondary" :
                          app.status === "approved" ? "default" : "destructive"
                        }>
                          {app.status === "pending" ? "Beklemede" :
                           app.status === "approved" ? "Onaylandı" : "Reddedildi"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {app.user?.username} • {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {app.teamLogo && (
                        <div>
                          <img 
                            src={app.teamLogo} 
                            alt={app.teamName} 
                            className="w-16 h-16 object-contain rounded"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">Açıklama:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.description}</p>
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
