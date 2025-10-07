import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Shield, ShieldOff, CheckCircle, XCircle, User, Eye } from "lucide-react";

const ROLES = ["DIAMOND VIP", "GOLD VIP", "SILVER VIP", "Lig Oyuncusu", "HaxArena Üye"];

export default function ManagementPanelPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/management/users"],
    enabled: !!user?.isSuperAdmin,
  });

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/settings"],
    enabled: !!user?.isSuperAdmin,
  });

  const { data: adminApplications } = useQuery<any[]>({
    queryKey: ["/api/applications/admin"],
    enabled: !!user?.isSuperAdmin,
  });

  const settingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Ayarlar güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Ayarlar güncellenemedi", variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("PATCH", `/api/management/users/${userId}/approve`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Kullanıcı onaylandı" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/management/users/${userId}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Kullanıcı reddedildi" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    },
  });

  const roleUpdateMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/management/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Rol güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Rol güncellenemedi", variant: "destructive" });
    },
  });

  const adminToggleMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      return await apiRequest("PATCH", `/api/management/users/${userId}/admin`, { isAdmin });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Admin yetkisi güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/applications/admin/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Başvuru güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    },
  });

  if (!user?.isSuperAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={user} onLogout={logout} />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Bu sayfaya erişim yetkiniz yok</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pendingUsers = users?.filter(u => !u.isApproved) || [];
  const approvedUsers = users?.filter(u => u.isApproved) || [];
  const pendingApplications = adminApplications?.filter(a => a.status === "pending") || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Yönetim Paneli</h1>
            <p className="text-muted-foreground">Platform yönetimi ve ayarları</p>
          </div>

          <div className="space-y-8">
            {/* Başvuru Ayarları */}
            <Card>
              <CardHeader>
                <CardTitle>Başvuru Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-apps" className="cursor-pointer">
                    <div>
                      <p className="font-medium">Admin Başvuruları</p>
                      <p className="text-sm text-muted-foreground">
                        {settings?.adminApplicationsOpen ? "Açık" : "Kapalı"}
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="admin-apps"
                    checked={settings?.adminApplicationsOpen || false}
                    onCheckedChange={(checked) => 
                      settingsMutation.mutate({ adminApplicationsOpen: checked })
                    }
                    data-testid="switch-admin-applications"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="team-apps" className="cursor-pointer">
                    <div>
                      <p className="font-medium">Takım Başvuruları</p>
                      <p className="text-sm text-muted-foreground">
                        {settings?.teamApplicationsOpen ? "Açık" : "Kapalı"}
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="team-apps"
                    checked={settings?.teamApplicationsOpen || false}
                    onCheckedChange={(checked) => 
                      settingsMutation.mutate({ teamApplicationsOpen: checked })
                    }
                    data-testid="switch-team-applications"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bekleyen Admin Başvuruları */}
            <Card>
              <CardHeader>
                <CardTitle>Bekleyen Admin Başvuruları ({pendingApplications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApplications.map((app) => (
                    <div key={app.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{app.user?.username}</span>
                          <Badge variant="secondary">{app.user?.role}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => applicationMutation.mutate({ id: app.id, status: "approved" })}
                            disabled={applicationMutation.isPending}
                            data-testid={`button-approve-${app.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Onayla
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => applicationMutation.mutate({ id: app.id, status: "rejected" })}
                            disabled={applicationMutation.isPending}
                            data-testid={`button-reject-${app.id}`}
                          >
                            Reddet
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>İsim:</strong> {app.name}</div>
                        <div><strong>Yaş:</strong> {app.age}</div>
                        <div><strong>Oyun Nick:</strong> {app.gameNick}</div>
                        <div><strong>Discord:</strong> {app.discordNick}</div>
                        <div className="col-span-2"><strong>Süre:</strong> {app.playDuration}</div>
                        <div className="col-span-2"><strong>Günlük Saat:</strong> {app.dailyHours}</div>
                      </div>
                    </div>
                  ))}
                  {pendingApplications.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">Bekleyen başvuru yok</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bekleyen Kullanıcı Onayları */}
            <Card>
              <CardHeader>
                <CardTitle>Bekleyen Kullanıcı Onayları ({pendingUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg gap-2">
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-sm text-muted-foreground">{u.email || "Email yok"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(u.id)}
                          disabled={approveMutation.isPending}
                          data-testid={`button-approve-user-${u.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(u.id)}
                          disabled={rejectMutation.isPending}
                          data-testid={`button-reject-user-${u.id}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reddet
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingUsers.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">Bekleyen kullanıcı yok</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Onaylı Kullanıcılar */}
            <Card>
              <CardHeader>
                <CardTitle>Onaylı Kullanıcılar ({approvedUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {approvedUsers.map((u) => (
                    <div key={u.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{u.username}</p>
                          <Badge variant="secondary">{u.role}</Badge>
                          {u.isAdmin && <Badge variant="default">Admin</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPasswords({ ...showPasswords, [u.id]: !showPasswords[u.id] })}
                            data-testid={`button-show-password-${u.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {showPasswords[u.id] && (
                            <code className="text-xs bg-muted px-2 py-1 rounded">{u.password}</code>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`role-${u.id}`} className="text-sm">Rol:</Label>
                          <Select
                            value={u.role}
                            onValueChange={(role) => roleUpdateMutation.mutate({ userId: u.id, role })}
                          >
                            <SelectTrigger className="w-40" id={`role-${u.id}`} data-testid={`select-role-${u.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          variant={u.isAdmin ? "destructive" : "default"}
                          onClick={() => adminToggleMutation.mutate({ userId: u.id, isAdmin: !u.isAdmin })}
                          disabled={adminToggleMutation.isPending}
                          data-testid={`button-toggle-admin-${u.id}`}
                        >
                          {u.isAdmin ? (
                            <>
                              <ShieldOff className="w-4 h-4 mr-1" />
                              Admin Kaldır
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-1" />
                              Admin Yap
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
