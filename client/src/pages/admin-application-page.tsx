import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const [reason, setReason] = useState("");

  const { data: applications } = useQuery<any[]>({
    queryKey: ["/api/applications/admin"],
  });

  const { data: myApplications } = useQuery<any[]>({
    queryKey: ["/api/applications/admin/my"],
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: async (data: { reason: string }) => {
      return await apiRequest("POST", "/api/applications/admin", data);
    },
    onSuccess: () => {
      toast({
        title: "Başvuru Gönderildi",
        description: "Başvurunuz yöneticilere iletildi",
      });
      setReason("");
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
    applyMutation.mutate({ reason });
  };

  const hasPendingApplication = myApplications?.some(app => app.status === "pending");

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Admin Başvurusu</h1>
            <p className="text-muted-foreground">Adminlik için başvuru yapın</p>
          </div>

          <div className="grid gap-6">
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Yeni Başvuru</CardTitle>
                  <CardDescription>Neden admin olmak istediğinizi açıklayın</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {hasPendingApplication && (
                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Bekleyen bir başvurunuz var. Sonuçlandırılması bekleniyor.
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="reason">Başvuru Nedeni</Label>
                      <Textarea
                        id="reason"
                        placeholder="Neden admin olmak istiyorsunuz? Deneyimleriniz nelerdir?"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        rows={5}
                        disabled={hasPendingApplication}
                        data-testid="textarea-reason"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={applyMutation.isPending || hasPendingApplication}
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
                      <div className="flex items-center justify-between">
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
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{app.reason}</p>
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
