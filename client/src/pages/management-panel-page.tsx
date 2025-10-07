import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Shield, ShieldOff, CheckCircle, XCircle, User, Eye, Trash2, Plus, Lock, Unlock, Archive, ArchiveRestore } from "lucide-react";

const ROLES = ["DIAMOND VIP", "GOLD VIP", "SILVER VIP", "Lig Oyuncusu", "HaxArena Üye"];
const STAFF_ROLES = [
  "Master Coordinator",
  "Coordinator Admin",
  "Head Overseer Admin",
  "Inspector Admin",
  "Game Admin",
  "Arena Admin"
];

export default function ManagementPanelPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");

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

  const { data: staffRoles } = useQuery<any[]>({
    queryKey: ["/api/staff-roles"],
  });

  const { data: forumPosts } = useQuery<any[]>({
    queryKey: ["/api/forum-posts"],
    enabled: !!user?.isAdmin,
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

  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/applications/admin/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Başvuru silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/admin"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    },
  });

  const addStaffMutation = useMutation({
    mutationFn: async (data: { name: string; role: string; managementAccess: boolean }) => {
      return await apiRequest("POST", "/api/staff-roles", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Staff eklendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-roles"] });
      setStaffName("");
      setStaffRole("");
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    },
  });

  const toggleStaffAccessMutation = useMutation({
    mutationFn: async ({ id, managementAccess }: { id: string; managementAccess: boolean }) => {
      return await apiRequest("PATCH", `/api/staff-roles/${id}`, { managementAccess });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Yönetim erişimi güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-roles"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/staff-roles/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Staff silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-roles"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    },
  });

  const deleteForumPostMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/forum-posts/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      toast({ title: "Başarılı", description: "Konu silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Konu silinemedi", variant: "destructive" });
    },
  });

  const toggleForumPostLockMutation = useMutation({
    mutationFn: async ({ id, isLocked }: { id: string; isLocked: boolean }) => {
      return await apiRequest("PATCH", `/api/forum-posts/${id}`, { isLocked });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      toast({ title: "Başarılı", description: "Konu durumu güncellendi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Konu durumu güncellenemedi", variant: "destructive" });
    },
  });

  const toggleForumPostArchiveMutation = useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      return await apiRequest("PATCH", `/api/forum-posts/${id}`, { isArchived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      toast({ title: "Başarılı", description: "Konu arşiv durumu güncellendi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Konu arşiv durumu güncellenemedi", variant: "destructive" });
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
                            <XCircle className="w-4 h-4 mr-1" />
                            Reddet
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteApplicationMutation.mutate(app.id)}
                            disabled={deleteApplicationMutation.isPending}
                            data-testid={`button-delete-application-${app.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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

            {/* Admin Kadrosu */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Kadrosu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="İsim"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    data-testid="input-staff-name"
                  />
                  <Select value={staffRole} onValueChange={setStaffRole}>
                    <SelectTrigger className="w-60" data-testid="select-staff-role">
                      <SelectValue placeholder="Rol Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      if (staffName && staffRole) {
                        addStaffMutation.mutate({
                          name: staffName,
                          role: staffRole,
                          managementAccess: staffRole === "Master Coordinator" || staffRole === "Coordinator Admin"
                        });
                      }
                    }}
                    disabled={!staffName || !staffRole || addStaffMutation.isPending}
                    data-testid="button-add-staff"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ekle
                  </Button>
                </div>
                <div className="space-y-2">
                  {staffRoles?.map((staff) => (
                    <div key={staff.id} className="p-3 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStaffMutation.mutate(staff.id)}
                          disabled={deleteStaffMutation.isPending}
                          data-testid={`button-delete-staff-${staff.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`access-${staff.id}`} className="cursor-pointer">
                          <div>
                            <p className="font-medium text-sm">Yönetim Erişimi</p>
                            <p className="text-xs text-muted-foreground">
                              {staff.managementAccess ? "Aktif" : "Pasif"}
                            </p>
                          </div>
                        </Label>
                        <Switch
                          id={`access-${staff.id}`}
                          checked={staff.managementAccess || false}
                          onCheckedChange={(checked) => 
                            toggleStaffAccessMutation.mutate({ id: staff.id, managementAccess: checked })
                          }
                          disabled={toggleStaffAccessMutation.isPending}
                          data-testid={`switch-staff-access-${staff.id}`}
                        />
                      </div>
                    </div>
                  ))}
                  {!staffRoles?.length && (
                    <p className="text-center text-muted-foreground py-4">Henüz staff eklenmedi</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Forum Yönetimi */}
            {user?.isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Forum Yönetimi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forumPosts?.map((post) => (
                      <div key={post.id} className="p-4 border rounded-lg space-y-3" data-testid={`card-forum-post-${post.id}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                                {post.category}
                              </span>
                              {post.isLocked && (
                                <span className="text-xs px-2 py-1 rounded-md bg-orange-500/10 text-orange-500 font-medium">
                                  Kilitli
                                </span>
                              )}
                              {post.isArchived && (
                                <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
                                  Arşivlendi
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-base mb-1" data-testid={`text-forum-post-title-${post.id}`}>
                              {post.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Yazar: {post.user?.username || "Bilinmeyen"} • {post.replyCount || 0} cevap
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteForumPostMutation.mutate(post.id)}
                            disabled={deleteForumPostMutation.isPending}
                            data-testid={`button-delete-forum-post-${post.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleForumPostLockMutation.mutate({ id: post.id, isLocked: !post.isLocked })}
                            disabled={toggleForumPostLockMutation.isPending}
                            data-testid={`button-toggle-lock-${post.id}`}
                          >
                            {post.isLocked ? (
                              <>
                                <Unlock className="w-4 h-4 mr-1" />
                                Kilidi Aç
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 mr-1" />
                                Kilitle
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleForumPostArchiveMutation.mutate({ id: post.id, isArchived: !post.isArchived })}
                            disabled={toggleForumPostArchiveMutation.isPending}
                            data-testid={`button-toggle-archive-${post.id}`}
                          >
                            {post.isArchived ? (
                              <>
                                <ArchiveRestore className="w-4 h-4 mr-1" />
                                Arşivden Çıkar
                              </>
                            ) : (
                              <>
                                <Archive className="w-4 h-4 mr-1" />
                                Arşivle
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!forumPosts?.length && (
                      <p className="text-center text-muted-foreground py-4" data-testid="text-no-forum-posts">
                        Henüz forum konusu bulunmamaktadır
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
