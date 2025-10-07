import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Shield, ShieldOff, CheckCircle, User } from "lucide-react";

const ROLES = ["DIAMOND VIP", "GOLD VIP", "SILVER VIP", "Lig Oyuncusu", "HaxArena Üye"];

export default function ManagementPanelPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/management/users"],
    enabled: !!user?.isSuperAdmin,
  });

  const { data: adminApplications } = useQuery<any[]>({
    queryKey: ["/api/applications/admin"],
    enabled: !!user?.isSuperAdmin,
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
            <p className="text-muted-foreground">Kullanıcı ve başvuru yönetimi</p>
          </div>

          <div className="space-y-8">
            {/* Bekleyen Admin Başvuruları */}
            <Card>
              <CardHeader>
                <CardTitle>Bekleyen Admin Başvuruları ({pendingApplications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApplications.map((app) => (
                    <div key={app.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{app.user?.username}</span>
                          <Badge variant="secondary">{app.user?.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{app.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => applicationMutation.mutate({ id: app.id, status: "approved" })}
                          disabled={applicationMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => applicationMutation.mutate({ id: app.id, status: "rejected" })}
                          disabled={applicationMutation.isPending}
                        >
                          Reddet
                        </Button>
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
                    <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-sm text-muted-foreground">{u.email || "Email yok"}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(u.id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Onayla
                      </Button>
                    </div>
                  ))}
                  {pendingUsers.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">Bekleyen kullanıcı yok</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tüm Kullanıcılar */}
            <Card>
              <CardHeader>
                <CardTitle>Tüm Kullanıcılar ({approvedUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedUsers.map((u) => (
                    <div key={u.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{u.username}</p>
                            <p className="text-sm text-muted-foreground">{u.email || "Email yok"}</p>
                          </div>
                          {u.isAdmin && (
                            <Badge variant="default">Admin</Badge>
                          )}
                          {u.isSuperAdmin && (
                            <Badge variant="destructive">Yönetim</Badge>
                          )}
                        </div>
                        <Badge variant="secondary">{u.role}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={u.role}
                          onValueChange={(role) => roleUpdateMutation.mutate({ userId: u.id, role })}
                          disabled={roleUpdateMutation.isPending || u.isSuperAdmin}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Rol seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!u.isSuperAdmin && (
                          <Button
                            size="sm"
                            variant={u.isAdmin ? "destructive" : "default"}
                            onClick={() => adminToggleMutation.mutate({ userId: u.id, isAdmin: !u.isAdmin })}
                            disabled={adminToggleMutation.isPending}
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
                        )}
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
