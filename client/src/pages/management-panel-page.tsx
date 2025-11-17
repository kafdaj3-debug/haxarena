import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest, buildApiUrl } from "@/lib/queryClient";
import { Shield, ShieldOff, CheckCircle, XCircle, User, Trash2, Plus, Lock, Unlock, Archive, ArchiveRestore, Calendar, Image as ImageIcon, X, Edit } from "lucide-react";

const ROLES = ["DIAMOND VIP", "GOLD VIP", "SILVER VIP", "Lig Oyuncusu", "HaxArena Üye"];
const PLAYER_ROLES = ["Kaleci", "Defans", "Orta Saha", "Forvet", "Yedek"];
const STAFF_ROLES = [
  "Founder",
  "Master Coordinator",
  "Coordinator Admin",
  "Head Overseer Admin",
  "Inspector Admin",
  "Game Admin",
  "Arena Admin"
];

// Helper function: datetime-local formatı için local timezone string
const getLocalDateTimeString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function ManagementPanelPage() {
  const { user, logout, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [ipReason, setIpReason] = useState("");
  const [resetCodes, setResetCodes] = useState<Record<string, string>>({});
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  
  // League state
  const [teamName, setTeamName] = useState("");
  const [teamLogo, setTeamLogo] = useState("");
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [matchDate, setMatchDate] = useState(() => {
    // Varsayılan olarak bugün saat 20:00 (Local timezone)
    const now = new Date();
    now.setHours(20, 0, 0, 0);
    return getLocalDateTimeString(now);
  });
  const [week, setWeek] = useState("");
  const [isBye, setIsBye] = useState(false);
  const [byeSide, setByeSide] = useState<"home" | "away" | "">("");
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [matchGoals, setMatchGoals] = useState<Array<{ playerName: string; minute: number; assistPlayerName?: string; isHomeTeam: boolean }>>([]);
  const [matchRecordingUrl, setMatchRecordingUrl] = useState("");
  const [isPostponed, setIsPostponed] = useState(false);
  const [editingDateFixtureId, setEditingDateFixtureId] = useState<string | null>(null);
  const [newMatchDate, setNewMatchDate] = useState("");
  
  // Player stats state
  const [selectedFixtureForStats, setSelectedFixtureForStats] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTeamIdForStats, setSelectedTeamIdForStats] = useState("");
  const [statsGoals, setStatsGoals] = useState("");
  const [statsAssists, setStatsAssists] = useState("");
  const [statsDm, setStatsDm] = useState("");
  const [statsCleanSheets, setStatsCleanSheets] = useState("");
  const [statsSaves, setStatsSaves] = useState("");
  const [editingStatsId, setEditingStatsId] = useState<string | null>(null);
  
  // Team of week state
  const [totwWeek, setTotwWeek] = useState("");
  const [totwImage, setTotwImage] = useState("");
  
  // Manual team edit state
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState("");
  const [editingTeamLogo, setEditingTeamLogo] = useState("");
  const [manualPoints, setManualPoints] = useState("");
  const [manualPlayed, setManualPlayed] = useState("");
  const [manualWon, setManualWon] = useState("");
  const [manualDrawn, setManualDrawn] = useState("");
  const [manualLost, setManualLost] = useState("");
  const [manualGoalsFor, setManualGoalsFor] = useState("");
  const [manualGoalsAgainst, setManualGoalsAgainst] = useState("");
  const [manualHeadToHead, setManualHeadToHead] = useState("");

  // Custom roles state
  const [roleName, setRoleName] = useState("");
  const [roleColor, setRoleColor] = useState("#3b82f6");
  const [rolePriority, setRolePriority] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState("");
  const [selectedRoleToAssign, setSelectedRoleToAssign] = useState("");

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // This is a React rule - hooks must be called unconditionally
  // Redirect to management login if not super admin (using useEffect)
  useEffect(() => {
    if (!isLoading && (!user || !user.isSuperAdmin)) {
      navigate("/yonetim-giris");
    }
  }, [user, isLoading, navigate]);

  const { data: users, error: usersError, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/management/users"],
    enabled: !!user?.isSuperAdmin,
    retry: 2,
    onError: (error) => {
      console.error("❌ Users query error:", error);
    },
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
    enabled: !!user?.isSuperAdmin,
  });

  const { data: forumPosts } = useQuery<any[]>({
    queryKey: ["/api/forum-posts"],
    enabled: !!user?.isSuperAdmin,
  });

  const { data: bannedIps } = useQuery<any[]>({
    queryKey: ["/api/banned-ips"],
    enabled: !!user?.isSuperAdmin,
  });

  const { data: leagueTeams } = useQuery<any[]>({
    queryKey: ["/api/league/teams"],
    enabled: !!user?.isSuperAdmin,
  });

  const { data: leagueFixtures, error: fixturesError, isLoading: fixturesLoading } = useQuery<any[]>({
    queryKey: ["/api/league/fixtures"],
    enabled: !!user?.isSuperAdmin,
    retry: 2,
    onError: (error) => {
      console.error("❌ Fixtures query error:", error);
    },
  });

  const { data: customRoles } = useQuery<any[]>({
    queryKey: ["/api/custom-roles"],
    enabled: !!user?.isSuperAdmin,
  });

  const settingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: async () => {
      toast({ title: "Başarılı", description: "Ayarlar güncellendi" });
      // Force refetch of settings on all pages
      await queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      await queryClient.refetchQueries({ queryKey: ["/api/settings"] });
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
      return await apiRequest("PATCH", `/api/management/users/${userId}/reject`, {});
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

  const playerRoleUpdateMutation = useMutation({
    mutationFn: async ({ userId, playerRole }: { userId: string; playerRole: string }) => {
      return await apiRequest("PATCH", `/api/management/users/${userId}/player-role`, { playerRole });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Oyuncu rolü güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Oyuncu rolü güncellenemedi", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/management/users/${userId}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Kullanıcı silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kullanıcı silinemedi", variant: "destructive" });
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

  const banIpMutation = useMutation({
    mutationFn: async (data: { ipAddress: string; reason?: string }) => {
      return await apiRequest("POST", "/api/banned-ips", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "IP adresi engellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/banned-ips"] });
      setIpAddress("");
      setIpReason("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Hata", 
        description: error.message || "IP engellenemedi", 
        variant: "destructive" 
      });
    },
  });

  const unbanIpMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/banned-ips/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "IP ban kaldırıldı" });
      queryClient.invalidateQueries({ queryKey: ["/api/banned-ips"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "IP ban kaldırılamadı", variant: "destructive" });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      return await apiRequest("POST", "/api/management/create-admin", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Yeni admin oluşturuldu" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
      setAdminUsername("");
      setAdminPassword("");
      setAdminConfirmPassword("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Hata", 
        description: error.message || "Admin oluşturulamadı", 
        variant: "destructive" 
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch(buildApiUrl("/api/password-reset/request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });
      if (!response.ok) throw new Error("Şifre sıfırlama başarısız");
      return await response.json();
    },
    onSuccess: (data, username) => {
      const code = data.message.replace("Şifre sıfırlama kodu: ", "");
      setResetCodes({ ...resetCodes, [username]: code });
      toast({ 
        title: "Kod Üretildi", 
        description: "Şifre sıfırlama kodu kullanıcıya verilebilir",
      });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kod üretilemedi", variant: "destructive" });
    },
  });

  const banToggleMutation = useMutation({
    mutationFn: async ({ userId, isBanned, banReason }: { userId: string; isBanned: boolean; banReason: string }) => {
      return await apiRequest("PATCH", `/api/management/users/${userId}`, { isBanned, banReason });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Kullanıcı ban durumu güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Ban durumu güncellenemedi", variant: "destructive" });
    },
  });

  const muteToggleMutation = useMutation({
    mutationFn: async ({ userId, isMuted }: { userId: string; isMuted: boolean }) => {
      return await apiRequest("PATCH", `/api/management/users/${userId}`, { isChatMuted: isMuted });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Kullanıcı mute durumu güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Mute durumu güncellenemedi", variant: "destructive" });
    },
  });

  // League mutations
  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string; logo?: string }) => {
      return await apiRequest("POST", "/api/league/teams", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Takım oluşturuldu" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/teams"] });
      setTeamName("");
      setTeamLogo("");
    },
    onError: () => {
      toast({ title: "Hata", description: "Takım oluşturulamadı", variant: "destructive" });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/league/teams/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Takım silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/league/fixtures"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Takım silinemedi", variant: "destructive" });
    },
  });

  const createFixtureMutation = useMutation({
    mutationFn: async (data: { homeTeamId?: string; awayTeamId?: string; matchDate?: string; week: number; isBye?: boolean; byeSide?: string }) => {
      return await apiRequest("POST", "/api/league/fixtures", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: isBye ? "BAY geçme oluşturuldu" : "Maç oluşturuldu" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/fixtures"] });
      setHomeTeamId("");
      setAwayTeamId("");
      // Varsayılan olarak bugün saat 20:00'a sıfırla
      const now = new Date();
      now.setHours(20, 0, 0, 0);
      setMatchDate(getLocalDateTimeString(now));
      setWeek("");
      setIsBye(false);
      setByeSide("");
    },
    onError: () => {
      toast({ title: "Hata", description: isBye ? "BAY geçme oluşturulamadı" : "Maç oluşturulamadı", variant: "destructive" });
    },
  });

  const updateFixtureScoreMutation = useMutation({
    mutationFn: async ({ id, homeScore, awayScore, goals, matchRecordingUrl }: { 
      id: string; 
      homeScore: number; 
      awayScore: number;
      goals?: Array<{ playerName: string; minute: number; assistPlayerName?: string; isHomeTeam: boolean }>;
      matchRecordingUrl?: string;
    }) => {
      return await apiRequest("PATCH", `/api/league/fixtures/${id}`, { 
        homeScore, 
        awayScore,
        goals: goals || [],
        matchRecordingUrl: matchRecordingUrl || undefined
      });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Maç sonucu güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/fixtures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/league/teams"] });
      setSelectedFixture(null);
      setHomeScore("");
      setAwayScore("");
      setMatchGoals([]);
      setMatchRecordingUrl("");
    },
    onError: () => {
      toast({ title: "Hata", description: "Maç sonucu güncellenemedi", variant: "destructive" });
    },
  });

  const updateFixturePostponedMutation = useMutation({
    mutationFn: async ({ id, isPostponed }: { id: string; isPostponed: boolean }) => {
      return await apiRequest("PATCH", `/api/league/fixtures/${id}/postpone`, { isPostponed });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Maç ertelenme durumu güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/fixtures"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Maç ertelenme durumu güncellenemedi", variant: "destructive" });
    },
  });

  const updateFixtureDateMutation = useMutation({
    mutationFn: async ({ id, matchDate }: { id: string; matchDate: string }) => {
      return await apiRequest("PATCH", `/api/league/fixtures/${id}/date`, { matchDate });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Maç tarihi güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/fixtures"] });
      setEditingDateFixtureId(null);
      setNewMatchDate("");
    },
    onError: () => {
      toast({ title: "Hata", description: "Maç tarihi güncellenemedi", variant: "destructive" });
    },
  });

  const deleteFixtureMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/league/fixtures/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Maç silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/fixtures"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Maç silinemedi", variant: "destructive" });
    },
  });

  // Manual team update mutation
  const manualTeamUpdateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/league/teams/${id}/manual`, data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Takım istatistikleri güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/teams"] });
      setEditingTeamId(null);
      setManualPoints("");
      setManualPlayed("");
      setManualWon("");
      setManualDrawn("");
      setManualLost("");
      setManualGoalsFor("");
      setManualGoalsAgainst("");
      setManualHeadToHead("");
    },
    onError: () => {
      toast({ title: "Hata", description: "İstatistikler güncellenemedi", variant: "destructive" });
    },
  });

  // Player stats queries and mutations
  const { data: allUsers } = useQuery<any[]>({
    queryKey: ["/api/management/users"],
    enabled: !!user?.isSuperAdmin,
  });

  const { data: playerStats } = useQuery<any[]>({
    queryKey: ["/api/league/fixtures", selectedFixtureForStats, "stats"],
    queryFn: async () => {
      if (!selectedFixtureForStats) return [];
      const res = await fetch(`/api/league/fixtures/${selectedFixtureForStats}/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!selectedFixtureForStats,
  });

  const createPlayerStatsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/league/stats", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Oyuncu istatistiği eklendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/fixtures", selectedFixtureForStats, "stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/league/stats/leaderboard"] });
      setSelectedUserId("");
      setSelectedTeamIdForStats("");
      setStatsGoals("");
      setStatsAssists("");
      setStatsDm("");
      setStatsCleanSheets("");
      setStatsSaves("");
    },
    onError: () => {
      toast({ title: "Hata", description: "İstatistik eklenemedi", variant: "destructive" });
    },
  });

  const updatePlayerStatsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/league/stats/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "İstatistik güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/fixtures", selectedFixtureForStats, "stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/league/stats/leaderboard"] });
      setEditingStatsId(null);
      setStatsGoals("");
      setStatsAssists("");
      setStatsDm("");
      setStatsCleanSheets("");
      setStatsSaves("");
    },
    onError: () => {
      toast({ title: "Hata", description: "İstatistik güncellenemedi", variant: "destructive" });
    },
  });

  const deletePlayerStatsMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/league/stats/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "İstatistik silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/fixtures", selectedFixtureForStats, "stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/league/stats/leaderboard"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "İstatistik silinemedi", variant: "destructive" });
    },
  });

  // Team of week mutations
  const { data: teamsOfWeek } = useQuery<any[]>({
    queryKey: ["/api/league/team-of-week"],
  });

  const createTotwMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/league/team-of-week", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Haftanın kadrosu eklendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/team-of-week"] });
      setTotwWeek("");
      setTotwImage("");
    },
    onError: () => {
      toast({ title: "Hata", description: "Kadro eklenemedi", variant: "destructive" });
    },
  });

  const deleteTotwMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/league/team-of-week/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Haftanın kadrosu silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/league/team-of-week"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kadro silinemedi", variant: "destructive" });
    },
  });

  // Custom roles mutations
  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; priority: number }) => {
      return await apiRequest("POST", "/api/custom-roles", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Rol oluşturuldu" });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-roles"] });
      setRoleName("");
      setRoleColor("#3b82f6");
      setRolePriority("");
    },
    onError: () => {
      toast({ title: "Hata", description: "Rol oluşturulamadı", variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/custom-roles/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Rol güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-roles"] });
      setEditingRoleId(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Rol güncellenemedi", variant: "destructive" });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/custom-roles/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Rol silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-roles"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Rol silinemedi", variant: "destructive" });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      return await apiRequest("POST", `/api/users/${userId}/custom-roles`, { roleId });
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Rol atandı" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
      setSelectedUserForRole("");
      setSelectedRoleToAssign("");
    },
    onError: () => {
      toast({ title: "Hata", description: "Rol atanamadı", variant: "destructive" });
    },
  });

  const unassignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      return await apiRequest("DELETE", `/api/users/${userId}/custom-roles/${roleId}`, {});
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Rol kaldırıldı" });
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Rol kaldırılamadı", variant: "destructive" });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Görsel boyutu 5MB'dan küçük olmalıdır",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Yetki kontrol ediliyor...</div>
        </div>
      </div>
    );
  }

  // Block render if not super admin
  if (!user || !user.isSuperAdmin) {
    return null;
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

                <div className="flex items-center justify-between pt-4 border-t">
                  <Label htmlFor="statistics-visible" className="cursor-pointer">
                    <div>
                      <p className="font-medium">İstatistikler Bölümü</p>
                      <p className="text-sm text-muted-foreground">
                        Ana sayfada {settings?.statisticsVisible ? "görünür" : "gizli"}
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="statistics-visible"
                    checked={settings?.statisticsVisible ?? true}
                    onCheckedChange={(checked) => 
                      settingsMutation.mutate({ statisticsVisible: checked })
                    }
                    data-testid="switch-statistics-visible"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Yeni Admin Ekle */}
            <Card>
              <CardHeader>
                <CardTitle>Yeni Admin Ekle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-username">Kullanıcı Adı</Label>
                      <Input
                        id="admin-username"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Kullanıcı adı"
                        data-testid="input-admin-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Şifre</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="En az 6 karakter"
                        data-testid="input-admin-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-confirm-password">Şifre Tekrar</Label>
                      <Input
                        id="admin-confirm-password"
                        type="password"
                        value={adminConfirmPassword}
                        onChange={(e) => setAdminConfirmPassword(e.target.value)}
                        placeholder="Şifreyi tekrar girin"
                        data-testid="input-admin-confirm-password"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (!adminUsername || !adminPassword || !adminConfirmPassword) {
                        toast({ 
                          title: "Hata", 
                          description: "Tüm alanları doldurun", 
                          variant: "destructive" 
                        });
                        return;
                      }
                      if (adminPassword !== adminConfirmPassword) {
                        toast({ 
                          title: "Hata", 
                          description: "Şifreler eşleşmiyor", 
                          variant: "destructive" 
                        });
                        return;
                      }
                      createAdminMutation.mutate({
                        username: adminUsername,
                        password: adminPassword,
                      });
                    }}
                    disabled={createAdminMutation.isPending}
                    data-testid="button-create-admin"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Admin Oluştur
                  </Button>
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
                        <div className="col-span-2"><strong>Aktif Sunucular:</strong> {app.activeServers}</div>
                        <div className="col-span-2"><strong>Önceki Deneyim:</strong> {app.previousExperience}</div>
                        <div className="col-span-2"><strong>Aktif Zaman Dilimleri:</strong> {app.activeTimeZones}</div>
                        <div className="col-span-2"><strong>Kendinden Bahseder misin:</strong> {app.aboutYourself}</div>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{u.username}</p>
                          <Badge variant="secondary">{u.role}</Badge>
                          {u.isAdmin && <Badge variant="default">Admin</Badge>}
                          {u.customRoles?.filter((role: any) => role && role.id && role.name).map((role: any) => (
                            <Badge 
                              key={role.id} 
                              style={{ 
                                backgroundColor: role.color, 
                                color: '#fff',
                                borderColor: role.color 
                              }}
                            >
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetPasswordMutation.mutate(u.username)}
                          disabled={resetPasswordMutation.isPending}
                          data-testid={`button-reset-password-${u.id}`}
                        >
                          Şifre Sıfırla
                        </Button>
                      </div>
                      {resetCodes[u.username] && (
                        <div className="p-2 bg-primary/10 rounded border border-primary/30">
                          <p className="text-sm font-medium text-primary">Şifre Sıfırlama Kodu:</p>
                          <p className="font-mono text-lg font-bold text-primary">{resetCodes[u.username]}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Bu kodu kullanıcıya verin. 30 dakika geçerlidir.
                          </p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Son IP:</span> {u.lastIpAddress || "Bilinmiyor"}
                        </div>
                        {u.isBanned && (
                          <div className="p-2 bg-destructive/10 rounded border border-destructive/30">
                            <p className="text-sm font-medium text-destructive">Yasaklı</p>
                            <p className="text-xs text-muted-foreground">Sebep: {u.banReason || "Belirtilmemiş"}</p>
                          </div>
                        )}
                        {u.isChatMuted && (
                          <div className="p-2 bg-orange-500/10 rounded border border-orange-500/30">
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Sohbet Susturuldu</p>
                          </div>
                        )}
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
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`player-role-${u.id}`} className="text-sm">Oyuncu Rolü:</Label>
                          <Select
                            value={u.playerRole || "none"}
                            onValueChange={(playerRole) => {
                              const actualRole = playerRole === "none" ? "" : playerRole;
                              playerRoleUpdateMutation.mutate({ userId: u.id, playerRole: actualRole });
                            }}
                          >
                            <SelectTrigger className="w-40" id={`player-role-${u.id}`} data-testid={`select-player-role-${u.id}`}>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Yok</SelectItem>
                              {PLAYER_ROLES.map((role) => (
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
                        <Button
                          size="sm"
                          variant={u.isBanned ? "default" : "destructive"}
                          onClick={() => {
                            if (u.isBanned) {
                              banToggleMutation.mutate({ userId: u.id, isBanned: false, banReason: "" });
                            } else {
                              const reason = prompt("Ban sebebi:");
                              if (reason !== null) {
                                banToggleMutation.mutate({ userId: u.id, isBanned: true, banReason: reason });
                              }
                            }
                          }}
                          disabled={banToggleMutation.isPending}
                          data-testid={`button-toggle-ban-${u.id}`}
                        >
                          {u.isBanned ? "Ban Kaldır" : "Ban"}
                        </Button>
                        <Button
                          size="sm"
                          variant={u.isChatMuted ? "default" : "outline"}
                          onClick={() => muteToggleMutation.mutate({ userId: u.id, isMuted: !u.isChatMuted })}
                          disabled={muteToggleMutation.isPending}
                          data-testid={`button-toggle-mute-${u.id}`}
                        >
                          {u.isChatMuted ? "Mute Kaldır" : "Mute"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`${u.username} kullanıcısını silmek istediğinizden emin misiniz?`)) {
                              deleteUserMutation.mutate(u.id);
                            }
                          }}
                          disabled={deleteUserMutation.isPending}
                          data-testid={`button-delete-user-${u.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
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
                          managementAccess: staffRole === "Founder" || staffRole === "Master Coordinator" || staffRole === "Coordinator Admin"
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
                  {staffRoles?.map((staff) => {
                    const isFounder = staff.role === "Founder";
                    const canManageFounder = user?.isSuperAdmin; // Sadece super admin Founder'ı yönetebilir
                    
                    return (
                      <div key={staff.id} className="p-3 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-muted-foreground">{staff.role}</p>
                          </div>
                          {(!isFounder || canManageFounder) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteStaffMutation.mutate(staff.id)}
                              disabled={deleteStaffMutation.isPending}
                              data-testid={`button-delete-staff-${staff.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
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
                            disabled={toggleStaffAccessMutation.isPending || (isFounder && !canManageFounder)}
                            data-testid={`switch-staff-access-${staff.id}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {!staffRoles?.length && (
                    <p className="text-center text-muted-foreground py-4">Henüz staff eklenmedi</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* IP Ban Yönetimi */}
            <Card>
              <CardHeader>
                <CardTitle>IP Ban Yönetimi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="IP Adresi (örn: 192.168.1.1)"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    data-testid="input-ip-address"
                  />
                  <Input
                    placeholder="Sebep (opsiyonel)"
                    value={ipReason}
                    onChange={(e) => setIpReason(e.target.value)}
                    data-testid="input-ip-reason"
                  />
                  <Button
                    onClick={() => {
                      if (ipAddress.trim()) {
                        banIpMutation.mutate({ 
                          ipAddress: ipAddress.trim(),
                          reason: ipReason.trim() || undefined
                        });
                      }
                    }}
                    disabled={!ipAddress.trim() || banIpMutation.isPending}
                    data-testid="button-ban-ip"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Engelle
                  </Button>
                </div>
                <div className="space-y-2">
                  {bannedIps?.map((banned) => (
                    <div key={banned.id} className="p-3 border rounded-lg flex items-center justify-between" data-testid={`card-banned-ip-${banned.id}`}>
                      <div>
                        <p className="font-mono font-medium" data-testid={`text-banned-ip-${banned.id}`}>{banned.ipAddress}</p>
                        {banned.reason && (
                          <p className="text-sm text-muted-foreground">Sebep: {banned.reason}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Engelleyen: {banned.bannedByUser?.username || "Bilinmeyen"} • {new Date(banned.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unbanIpMutation.mutate(banned.id)}
                        disabled={unbanIpMutation.isPending}
                        data-testid={`button-unban-ip-${banned.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {!bannedIps?.length && (
                    <p className="text-center text-muted-foreground py-4" data-testid="text-no-banned-ips">Hiç engellenmiş IP yok</p>
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

            {/* Lig Yönetimi */}
            <Card>
              <CardHeader>
                <CardTitle>Lig Yönetimi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Takım Ekleme */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Takım Ekle</h3>
                  <div className="space-y-4">
                    <Input
                      placeholder="Takım Adı"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                    <div className="space-y-2">
                      <Label>Takım Logosu (Opsiyonel)</Label>
                      {teamLogo ? (
                        <div className="relative inline-block">
                          <img 
                            src={teamLogo} 
                            alt="Team Logo" 
                            className="w-20 h-20 object-contain rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => setTeamLogo("")}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, setTeamLogo)}
                            className="max-w-xs"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        if (teamName.trim()) {
                          createTeamMutation.mutate({ 
                            name: teamName.trim(), 
                            logo: teamLogo || undefined 
                          });
                        }
                      }}
                      disabled={!teamName.trim() || createTeamMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Takım Ekle
                    </Button>
                  </div>
                </div>

                {/* Takımlar Listesi */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Takımlar</h3>
                  <div className="space-y-2">
                    {leagueTeams?.map((team: any) => (
                      <div key={team.id} className="space-y-2">
                        <div className="p-3 border rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {team.logo && (
                              <img 
                                src={team.logo} 
                                alt={team.name} 
                                className="w-10 h-10 object-contain"
                              />
                            )}
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Puan: {team.points} | O: {team.played} | G: {team.won} | B: {team.drawn} | M: {team.lost}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTeamId(team.id);
                                setEditingTeamName(team.name);
                                setEditingTeamLogo(team.logo || "");
                                setManualPoints(team.points.toString());
                                setManualPlayed(team.played.toString());
                                setManualWon(team.won.toString());
                                setManualDrawn(team.drawn.toString());
                                setManualLost(team.lost.toString());
                                setManualGoalsFor(team.goalsFor.toString());
                                setManualGoalsAgainst(team.goalsAgainst.toString());
                                setManualHeadToHead((team.headToHead || 0).toString());
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm(`${team.name} takımını silmek istediğinizden emin misiniz?`)) {
                                  deleteTeamMutation.mutate(team.id);
                                }
                              }}
                              disabled={deleteTeamMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Manuel Düzenleme Formu */}
                        {editingTeamId === team.id && (
                          <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                            <h4 className="font-medium text-sm">Takım Bilgilerini Düzenle</h4>
                            
                            {/* Takım İsmi ve Logosu */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b">
                              <div className="space-y-1">
                                <Label className="text-xs">Takım İsmi</Label>
                                <Input
                                  type="text"
                                  value={editingTeamName}
                                  onChange={(e) => setEditingTeamName(e.target.value)}
                                  className="h-8 text-sm"
                                  placeholder="Takım ismi"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Takım Logosu URL</Label>
                                <Input
                                  type="url"
                                  value={editingTeamLogo}
                                  onChange={(e) => setEditingTeamLogo(e.target.value)}
                                  className="h-8 text-sm"
                                  placeholder="https://example.com/logo.png"
                                />
                              </div>
                            </div>
                            
                            <h4 className="font-medium text-sm pt-2">Manuel İstatistik Düzenleme</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Puan</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={manualPoints}
                                  onChange={(e) => setManualPoints(e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Oynanan</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={manualPlayed}
                                  onChange={(e) => setManualPlayed(e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Galibiyet</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={manualWon}
                                  onChange={(e) => setManualWon(e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Beraberlik</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={manualDrawn}
                                  onChange={(e) => setManualDrawn(e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Mağlubiyet</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={manualLost}
                                  onChange={(e) => setManualLost(e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Atılan Gol</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={manualGoalsFor}
                                  onChange={(e) => setManualGoalsFor(e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Yenilen Gol</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={manualGoalsAgainst}
                                  onChange={(e) => setManualGoalsAgainst(e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">İkili Averaj</Label>
                                <Input
                                  type="number"
                                  value={manualHeadToHead}
                                  onChange={(e) => setManualHeadToHead(e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  const data: any = {};
                                  // Takım ismi ve logosu
                                  if (editingTeamName.trim()) data.name = editingTeamName.trim();
                                  if (editingTeamLogo.trim()) data.logo = editingTeamLogo.trim();
                                  else if (editingTeamLogo === "") data.logo = null;
                                  
                                  // İstatistikler
                                  if (manualPoints) data.points = parseInt(manualPoints);
                                  if (manualPlayed) data.played = parseInt(manualPlayed);
                                  if (manualWon) data.won = parseInt(manualWon);
                                  if (manualDrawn) data.drawn = parseInt(manualDrawn);
                                  if (manualLost) data.lost = parseInt(manualLost);
                                  if (manualGoalsFor) data.goalsFor = parseInt(manualGoalsFor);
                                  if (manualGoalsAgainst) data.goalsAgainst = parseInt(manualGoalsAgainst);
                                  if (manualHeadToHead) data.headToHead = parseInt(manualHeadToHead);
                                  
                                  manualTeamUpdateMutation.mutate({ id: team.id, data });
                                }}
                                disabled={manualTeamUpdateMutation.isPending || !editingTeamName.trim()}
                              >
                                Kaydet
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingTeamId(null);
                                  setEditingTeamName("");
                                  setEditingTeamLogo("");
                                }}
                              >
                                İptal
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {!leagueTeams?.length && (
                      <p className="text-center text-muted-foreground py-4">Henüz takım eklenmedi</p>
                    )}
                  </div>
                </div>

                {/* Maç Oluşturma */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Maç Oluştur</h3>
                  
                  {/* BAY Geçme Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isBye" 
                      checked={isBye} 
                      onCheckedChange={(checked) => {
                        setIsBye(checked as boolean);
                        if (!checked) {
                          setByeSide("");
                          setHomeTeamId("");
                          setAwayTeamId("");
                        }
                      }}
                    />
                    <Label htmlFor="isBye" className="cursor-pointer">BAY Geçme</Label>
                  </div>

                  {isBye && (
                    <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                      <Label>BAY Geçen Taraf</Label>
                      <Select value={byeSide} onValueChange={(value) => {
                        setByeSide(value as "home" | "away");
                        // BAY geçen tarafı temizle
                        if (value === "home") {
                          setHomeTeamId("");
                        } else {
                          setAwayTeamId("");
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="BAY geçen tarafı seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Ev Sahibi (BAY)</SelectItem>
                          <SelectItem value="away">Deplasman (BAY)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ev Sahibi Takım {isBye && byeSide === "home" && <span className="text-muted-foreground">(BAY)</span>}</Label>
                      <Select 
                        value={homeTeamId} 
                        onValueChange={setHomeTeamId}
                        disabled={isBye && byeSide === "home"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isBye && byeSide === "home" ? "BAY geçen takım" : "Takım seçin"} />
                        </SelectTrigger>
                        <SelectContent>
                          {leagueTeams?.map((team: any) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Deplasman Takımı {isBye && byeSide === "away" && <span className="text-muted-foreground">(BAY)</span>}</Label>
                      <Select 
                        value={awayTeamId} 
                        onValueChange={setAwayTeamId}
                        disabled={isBye && byeSide === "away"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isBye && byeSide === "away" ? "BAY geçen takım" : "Takım seçin"} />
                        </SelectTrigger>
                        <SelectContent>
                          {leagueTeams?.filter((t: any) => t.id !== homeTeamId).map((team: any) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Maç Tarihi ve Saati {isBye && <span className="text-muted-foreground text-xs">(Opsiyonel)</span>}</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Input
                            type="date"
                            value={matchDate.split('T')[0]}
                            onChange={(e) => {
                              const time = matchDate.split('T')[1] || '20:00';
                              setMatchDate(`${e.target.value}T${time}`);
                            }}
                          />
                          <p className="text-xs text-muted-foreground">Tarih</p>
                        </div>
                        <div className="space-y-1">
                          <Select
                            value={matchDate.split('T')[1]?.split(':')[0] || '20'}
                            onValueChange={(hour) => {
                              const date = matchDate.split('T')[0];
                              const minute = matchDate.split('T')[1]?.split(':')[1] || '00';
                              setMatchDate(`${date}T${hour}:${minute}`);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Saat" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, '0');
                                return <SelectItem key={hour} value={hour}>{hour}</SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Saat (00-23)</p>
                        </div>
                        <div className="space-y-1">
                          <Select
                            value={matchDate.split('T')[1]?.split(':')[1] || '00'}
                            onValueChange={(minute) => {
                              const date = matchDate.split('T')[0];
                              const hour = matchDate.split('T')[1]?.split(':')[0] || '20';
                              setMatchDate(`${date}T${hour}:${minute}`);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Dakika" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {Array.from({ length: 60 }, (_, i) => {
                                const minute = i.toString().padStart(2, '0');
                                return <SelectItem key={minute} value={minute}>{minute}</SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Dakika (00-59)</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Hafta</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Hafta"
                        value={week}
                        onChange={(e) => setWeek(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (isBye) {
                        // BAY geçme için validasyon
                        if (!byeSide || !week) {
                          toast({ title: "Hata", description: "BAY geçme için taraf ve hafta gereklidir", variant: "destructive" });
                          return;
                        }
                        if (byeSide === "home" && !awayTeamId) {
                          toast({ title: "Hata", description: "Deplasman takımı seçilmelidir", variant: "destructive" });
                          return;
                        }
                        if (byeSide === "away" && !homeTeamId) {
                          toast({ title: "Hata", description: "Ev sahibi takım seçilmelidir", variant: "destructive" });
                          return;
                        }
                        createFixtureMutation.mutate({
                          homeTeamId: byeSide === "home" ? undefined : homeTeamId,
                          awayTeamId: byeSide === "away" ? undefined : awayTeamId,
                          matchDate: matchDate || undefined,
                          week: parseInt(week),
                          isBye: true,
                          byeSide,
                        });
                      } else {
                        // Normal maç için validasyon
                        if (!homeTeamId || !awayTeamId || !matchDate || !week) {
                          toast({ title: "Hata", description: "Tüm alanlar gereklidir", variant: "destructive" });
                          return;
                        }
                        createFixtureMutation.mutate({
                          homeTeamId,
                          awayTeamId,
                          matchDate,
                          week: parseInt(week),
                          isBye: false,
                        });
                      }
                    }}
                    disabled={
                      isBye 
                        ? (!byeSide || !week || (byeSide === "home" && !awayTeamId) || (byeSide === "away" && !homeTeamId)) || createFixtureMutation.isPending
                        : (!homeTeamId || !awayTeamId || !matchDate || !week) || createFixtureMutation.isPending
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {isBye ? "BAY Geçme Oluştur" : "Maç Oluştur"}
                  </Button>
                </div>

                {/* Fikstür Listesi ve Skor Girişi */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Fikstür ve Skor Girişi</h3>
                  <div className="space-y-3">
                    {leagueFixtures && Array.isArray(leagueFixtures) ? leagueFixtures.map((fixture: any) => {
                      const isBye = fixture.isBye;
                      return (
                      <div key={fixture.id} className={`p-4 border rounded-lg space-y-3 ${isBye ? "border-blue-500/30 bg-blue-500/10" : ""}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2 flex-1">
                              {isBye && fixture.byeSide === "home" ? (
                                <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded border border-blue-500/50">
                                  <span className="font-bold text-blue-600 text-xs">BAY</span>
                                </div>
                              ) : fixture.homeTeam?.logo ? (
                                <img src={fixture.homeTeam.logo} alt="" className="w-8 h-8 object-contain" />
                              ) : null}
                              <span className="font-medium">
                                {isBye && fixture.byeSide === "home" ? (
                                  <span className="text-blue-600 font-bold">BAY</span>
                                ) : (
                                  fixture.homeTeam?.name || "BAY"
                                )}
                              </span>
                            </div>
                            <div className="text-center px-4">
                              {isBye ? (
                                <span className="text-blue-600 font-bold text-sm bg-blue-500/20 px-2 py-1 rounded border border-blue-500/50">BAY GEÇME</span>
                              ) : fixture.isPlayed ? (
                                <span className="text-xl font-bold">
                                  {fixture.homeScore} - {fixture.awayScore}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">VS</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <span className="font-medium">
                                {isBye && fixture.byeSide === "away" ? (
                                  <span className="text-blue-600 font-bold">BAY</span>
                                ) : (
                                  fixture.awayTeam?.name || "BAY"
                                )}
                              </span>
                              {isBye && fixture.byeSide === "away" ? (
                                <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded border border-blue-500/50">
                                  <span className="font-bold text-blue-600 text-xs">BAY</span>
                                </div>
                              ) : fixture.awayTeam?.logo ? (
                                <img src={fixture.awayTeam.logo} alt="" className="w-8 h-8 object-contain" />
                              ) : null}
                            </div>
                          </div>
                        </div>
                        {!isBye && (
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {editingDateFixtureId === fixture.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="datetime-local"
                                    value={newMatchDate}
                                    onChange={(e) => setNewMatchDate(e.target.value)}
                                    className="w-48"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      if (newMatchDate) {
                                        updateFixtureDateMutation.mutate({
                                          id: fixture.id,
                                          matchDate: newMatchDate,
                                        });
                                      }
                                    }}
                                    disabled={updateFixtureDateMutation.isPending}
                                  >
                                    Kaydet
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingDateFixtureId(null);
                                      setNewMatchDate("");
                                    }}
                                  >
                                    İptal
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  {new Date(fixture.matchDate).toLocaleString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: 'Europe/Istanbul'
                                  })}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="ml-2 h-6 px-2"
                                    onClick={() => {
                                      setEditingDateFixtureId(fixture.id);
                                      setNewMatchDate(getLocalDateTimeString(new Date(fixture.matchDate)));
                                    }}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                            </span>
                            <div className="flex items-center gap-2">
                              {fixture.isPostponed && (
                                <Badge variant="destructive">ERTELENDİ</Badge>
                              )}
                              <span>Hafta {fixture.week}</span>
                            </div>
                          </div>
                        )}
                        {isBye && (
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="text-blue-600 font-medium">BAY Geçme - Hafta {fixture.week}</span>
                          </div>
                        )}
                        {selectedFixture && selectedFixture.id === fixture.id && !isBye ? (
                          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                placeholder="Ev Sahibi"
                                value={homeScore}
                                onChange={(e) => setHomeScore(e.target.value)}
                                className="w-20"
                              />
                              <span>-</span>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Deplasman"
                                value={awayScore}
                                onChange={(e) => setAwayScore(e.target.value)}
                                className="w-20"
                              />
                            </div>

                            {/* Maç Kaydı Linki */}
                            <div className="space-y-2">
                              <Label>Maç Kaydı Linki (Rec)</Label>
                              <Input
                                type="url"
                                placeholder="https://..."
                                value={matchRecordingUrl || ""}
                                onChange={(e) => setMatchRecordingUrl(e.target.value)}
                              />
                            </div>

                            {/* Gol/Asist Bilgileri */}
                            <div className="space-y-2">
                              <Label>Gol/Asist Bilgileri</Label>
                              {matchGoals && Array.isArray(matchGoals) && matchGoals.length > 0 ? (
                                matchGoals.map((goal, index) => {
                                  if (!goal || typeof goal !== 'object') {
                                    return null;
                                  }
                                  return (
                                    <div key={index} className="flex items-center gap-2 p-2 border rounded bg-background">
                                      <Input
                                        type="text"
                                        placeholder="Gol atan oyuncu ismi"
                                        value={goal?.playerName || ""}
                                        onChange={(e) => {
                                          try {
                                            const newGoals = [...(matchGoals || [])];
                                            if (newGoals[index]) {
                                              newGoals[index] = { ...newGoals[index], playerName: e.target.value };
                                              setMatchGoals(newGoals);
                                            }
                                          } catch (error) {
                                            console.error("Error updating goal playerName:", error);
                                          }
                                        }}
                                        className="w-40"
                                      />
                                      <Input
                                        type="number"
                                        min="1"
                                        max="90"
                                        placeholder="Dakika"
                                        value={goal?.minute || ""}
                                        onChange={(e) => {
                                          try {
                                            const newGoals = [...(matchGoals || [])];
                                            if (newGoals[index]) {
                                              newGoals[index] = { ...newGoals[index], minute: parseInt(e.target.value) || 0 };
                                              setMatchGoals(newGoals);
                                            }
                                          } catch (error) {
                                            console.error("Error updating goal minute:", error);
                                          }
                                        }}
                                        className="w-20"
                                      />
                                      <Select
                                        value={goal?.isHomeTeam ? "home" : "away"}
                                        onValueChange={(value) => {
                                          try {
                                            const newGoals = [...(matchGoals || [])];
                                            if (newGoals[index]) {
                                              newGoals[index] = { ...newGoals[index], isHomeTeam: value === "home" };
                                              setMatchGoals(newGoals);
                                            }
                                          } catch (error) {
                                            console.error("Error updating goal isHomeTeam:", error);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="w-32">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="home">Ev Sahibi</SelectItem>
                                          <SelectItem value="away">Deplasman</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Input
                                        type="text"
                                        placeholder="Asist yapan oyuncu ismi (opsiyonel)"
                                        value={goal?.assistPlayerName || ""}
                                        onChange={(e) => {
                                          try {
                                            const newGoals = [...(matchGoals || [])];
                                            if (newGoals[index]) {
                                              newGoals[index] = { ...newGoals[index], assistPlayerName: e.target.value || undefined };
                                              setMatchGoals(newGoals);
                                            }
                                          } catch (error) {
                                            console.error("Error updating goal assistPlayerName:", error);
                                          }
                                        }}
                                        className="w-40"
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          try {
                                            setMatchGoals((matchGoals || []).filter((_, i) => i !== index));
                                          } catch (error) {
                                            console.error("Error removing goal:", error);
                                          }
                                        }}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  );
                                })
                              ) : null}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  try {
                                    const currentGoals = matchGoals && Array.isArray(matchGoals) ? matchGoals : [];
                                    setMatchGoals([...currentGoals, { playerId: "", minute: 0, isHomeTeam: true }]);
                                  } catch (error) {
                                    console.error("Error adding goal:", error);
                                    toast({ title: "Hata", description: "Gol eklenirken bir hata oluştu", variant: "destructive" });
                                  }
                                }}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Gol Ekle
                              </Button>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  try {
                                    if (homeScore !== "" && awayScore !== "") {
                                      const validGoals = (matchGoals || [])
                                        .filter((g: any) => g && typeof g === 'object' && g.playerName && g.playerName.trim() && g.minute > 0)
                                        .map((g: any) => ({
                                          playerName: g.playerName.trim(),
                                          minute: g.minute,
                                          assistPlayerName: g.assistPlayerName?.trim() || undefined,
                                          isHomeTeam: g.isHomeTeam || false,
                                        }));
                                      
                                      updateFixtureScoreMutation.mutate({
                                        id: fixture.id,
                                        homeScore: parseInt(homeScore),
                                        awayScore: parseInt(awayScore),
                                        goals: validGoals,
                                        matchRecordingUrl: matchRecordingUrl || undefined,
                                      });
                                    }
                                  } catch (error) {
                                    console.error("Error saving fixture:", error);
                                    toast({ title: "Hata", description: "Maç kaydedilirken bir hata oluştu", variant: "destructive" });
                                  }
                                }}
                                disabled={updateFixtureScoreMutation.isPending}
                              >
                                Kaydet
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  try {
                                    setSelectedFixture(null);
                                    setHomeScore("");
                                    setAwayScore("");
                                    setMatchGoals([]);
                                    setMatchRecordingUrl("");
                                  } catch (error) {
                                    console.error("Error canceling:", error);
                                  }
                                }}
                              >
                                İptal
                              </Button>
                            </div>
                          </div>
                        ) : !isBye ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                try {
                                  setSelectedFixture(fixture);
                                  setHomeScore(fixture?.homeScore?.toString() || "");
                                  setAwayScore(fixture?.awayScore?.toString() || "");
                                  
                                  // Goals'i güvenli şekilde yükle
                                  let loadedGoals: Array<{ playerName: string; minute: number; assistPlayerName?: string; isHomeTeam: boolean }> = [];
                                  if (fixture?.goals && Array.isArray(fixture.goals)) {
                                    loadedGoals = fixture.goals
                                      .filter((g: any) => g && typeof g === 'object')
                                      .map((g: any) => ({
                                        playerName: g.playerName || g.player?.username || "",
                                        minute: g.minute || 0,
                                        assistPlayerName: g.assistPlayerName || g.assistPlayer?.username || undefined,
                                        isHomeTeam: g.isHomeTeam !== undefined ? g.isHomeTeam : false,
                                      }));
                                  }
                                  setMatchGoals(loadedGoals);
                                  setMatchRecordingUrl(fixture?.matchRecordingUrl || "");
                                } catch (error) {
                                  console.error("Error loading fixture:", error);
                                  toast({ title: "Hata", description: "Maç bilgileri yüklenirken bir hata oluştu", variant: "destructive" });
                                }
                              }}
                            >
                              {fixture?.isPlayed ? "Skoru Düzenle" : "Skor Gir"}
                            </Button>
                            <Button
                              size="sm"
                              variant={fixture?.isPostponed ? "default" : "outline"}
                              onClick={() => {
                                updateFixturePostponedMutation.mutate({ 
                                  id: fixture.id, 
                                  isPostponed: !fixture?.isPostponed 
                                });
                              }}
                              disabled={updateFixturePostponedMutation.isPending}
                            >
                              {fixture?.isPostponed ? "Ertelenme Kaldır" : "Ertelendi"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Bu maçı silmek istediğinizden emin misiniz?")) {
                                  deleteFixtureMutation.mutate(fixture.id);
                                }
                              }}
                              disabled={deleteFixtureMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Bu BAY geçmeyi silmek istediğinizden emin misiniz?")) {
                                  deleteFixtureMutation.mutate(fixture.id);
                                }
                              }}
                              disabled={deleteFixtureMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                      );
                    }) : (
                      <p className="text-center text-muted-foreground py-4">Yükleniyor...</p>
                    )}
                    {leagueFixtures && Array.isArray(leagueFixtures) && leagueFixtures.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">Henüz maç eklenmedi</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Oyuncu İstatistikleri Yönetimi */}
            <Card>
              <CardHeader>
                <CardTitle>Oyuncu İstatistikleri Yönetimi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Maç Seç */}
                <div className="space-y-4">
                  <Label>Maç Seçin</Label>
                  <Select value={selectedFixtureForStats} onValueChange={setSelectedFixtureForStats}>
                    <SelectTrigger>
                      <SelectValue placeholder="Maç seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagueFixtures?.filter((f: any) => f.isPlayed).map((fixture: any) => (
                        <SelectItem key={fixture.id} value={fixture.id}>
                          {fixture.homeTeam.name} vs {fixture.awayTeam.name} ({fixture.homeScore}-{fixture.awayScore})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedFixtureForStats && (
                  <>
                    {/* Oyuncu İstatistiği Ekle */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold">İstatistik Ekle</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Oyuncu</Label>
                          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Oyuncu seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {allUsers?.map((user: any) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Takım</Label>
                          <Select value={selectedTeamIdForStats} onValueChange={setSelectedTeamIdForStats}>
                            <SelectTrigger>
                              <SelectValue placeholder="Takım seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {leagueTeams?.map((team: any) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Gol"
                          value={statsGoals}
                          onChange={(e) => setStatsGoals(e.target.value)}
                        />
                        <Input
                          type="number"
                          min="0"
                          placeholder="Asist"
                          value={statsAssists}
                          onChange={(e) => setStatsAssists(e.target.value)}
                        />
                        <Input
                          type="number"
                          min="0"
                          placeholder="DM"
                          value={statsDm}
                          onChange={(e) => setStatsDm(e.target.value)}
                        />
                        <Input
                          type="number"
                          min="0"
                          placeholder="CS (Clean Sheet)"
                          value={statsCleanSheets}
                          onChange={(e) => setStatsCleanSheets(e.target.value)}
                        />
                        <Input
                          type="number"
                          min="0"
                          placeholder="Kurtarış"
                          value={statsSaves}
                          onChange={(e) => setStatsSaves(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (selectedUserId && selectedTeamIdForStats) {
                            createPlayerStatsMutation.mutate({
                              fixtureId: selectedFixtureForStats,
                              userId: selectedUserId,
                              teamId: selectedTeamIdForStats,
                              goals: parseInt(statsGoals) || 0,
                              assists: parseInt(statsAssists) || 0,
                              dm: parseInt(statsDm) || 0,
                              cleanSheets: parseInt(statsCleanSheets) || 0,
                              saves: parseInt(statsSaves) || 0,
                            });
                          }
                        }}
                        disabled={!selectedUserId || !selectedTeamIdForStats || createPlayerStatsMutation.isPending}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        İstatistik Ekle
                      </Button>
                    </div>

                    {/* İstatistikler Listesi */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold">Maç İstatistikleri</h3>
                      <div className="space-y-2">
                        {playerStats?.map((stat: any) => (
                          <div key={stat.id} className="space-y-2">
                            <div className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">{stat.user.username}</p>
                                  <p className="text-xs text-muted-foreground">{stat.team.name}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingStatsId(stat.id);
                                      setStatsGoals(stat.goals.toString());
                                      setStatsAssists(stat.assists.toString());
                                      setStatsDm(stat.dm.toString());
                                      setStatsCleanSheets(stat.cleanSheets.toString());
                                      setStatsSaves(stat.saves.toString());
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm("Bu istatistiği silmek istediğinizden emin misiniz?")) {
                                        deletePlayerStatsMutation.mutate(stat.id);
                                      }
                                    }}
                                    disabled={deletePlayerStatsMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-5 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Gol:</span>
                                  <span className="font-medium ml-1">{stat.goals}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Asist:</span>
                                  <span className="font-medium ml-1">{stat.assists}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">DM:</span>
                                  <span className="font-medium ml-1">{stat.dm}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">CS:</span>
                                  <span className="font-medium ml-1">{stat.cleanSheets}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Kurtarış:</span>
                                  <span className="font-medium ml-1">{stat.saves}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Düzenleme Formu */}
                            {editingStatsId === stat.id && (
                              <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                                <h4 className="font-medium text-sm">İstatistik Düzenleme</h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Gol</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={statsGoals}
                                      onChange={(e) => setStatsGoals(e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Asist</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={statsAssists}
                                      onChange={(e) => setStatsAssists(e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">DM</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={statsDm}
                                      onChange={(e) => setStatsDm(e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">CS</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={statsCleanSheets}
                                      onChange={(e) => setStatsCleanSheets(e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Kurtarış</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={statsSaves}
                                      onChange={(e) => setStatsSaves(e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const data: any = {};
                                      if (statsGoals) data.goals = parseInt(statsGoals);
                                      if (statsAssists) data.assists = parseInt(statsAssists);
                                      if (statsDm) data.dm = parseInt(statsDm);
                                      if (statsCleanSheets) data.cleanSheets = parseInt(statsCleanSheets);
                                      if (statsSaves) data.saves = parseInt(statsSaves);
                                      
                                      updatePlayerStatsMutation.mutate({ id: stat.id, data });
                                    }}
                                    disabled={updatePlayerStatsMutation.isPending}
                                  >
                                    Kaydet
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingStatsId(null);
                                      setStatsGoals("");
                                      setStatsAssists("");
                                      setStatsDm("");
                                      setStatsCleanSheets("");
                                      setStatsSaves("");
                                    }}
                                  >
                                    İptal
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {!playerStats?.length && (
                          <p className="text-center text-muted-foreground py-4">Bu maç için henüz istatistik eklenmedi</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Kullanıcı Rolleri Yönetimi */}
            <Card>
              <CardHeader>
                <CardTitle>🎭 Kullanıcı Rolleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rol Oluştur */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Yeni Rol Oluştur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Rol Adı</Label>
                      <Input
                        placeholder="Örn: VIP Üye"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Renk</Label>
                      <Input
                        type="color"
                        value={roleColor}
                        onChange={(e) => setRoleColor(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Öncelik (Yüksek = Önde)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={rolePriority}
                        onChange={(e) => setRolePriority(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (roleName) {
                        createRoleMutation.mutate({
                          name: roleName,
                          color: roleColor,
                          priority: parseInt(rolePriority) || 0,
                        });
                      }
                    }}
                    disabled={!roleName || createRoleMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Rol Oluştur
                  </Button>
                </div>

                {/* Roller Listesi */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Mevcut Roller</h3>
                  <div className="space-y-3">
                    {customRoles?.map((role: any) => (
                      <div key={role.id} className="p-3 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge style={{ backgroundColor: role.color, color: '#fff' }}>
                            {role.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Öncelik: {role.priority}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingRoleId(role.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Bu rolü silmek istediğinizden emin misiniz?")) {
                                deleteRoleMutation.mutate(role.id);
                              }
                            }}
                            disabled={deleteRoleMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!customRoles?.length && (
                      <p className="text-center text-muted-foreground py-4">Henüz rol oluşturulmadı</p>
                    )}
                  </div>
                </div>

                {/* Kullanıcıya Rol Ata */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Kullanıcıya Rol Ata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select value={selectedUserForRole} onValueChange={setSelectedUserForRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kullanıcı Seç" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedRoleToAssign} onValueChange={setSelectedRoleToAssign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rol Seç" />
                      </SelectTrigger>
                      <SelectContent>
                        {customRoles?.map((role: any) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => {
                      if (selectedUserForRole && selectedRoleToAssign) {
                        assignRoleMutation.mutate({
                          userId: selectedUserForRole,
                          roleId: selectedRoleToAssign,
                        });
                      }
                    }}
                    disabled={!selectedUserForRole || !selectedRoleToAssign || assignRoleMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Rol Ata
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Haftanın Kadrosu */}
            <Card>
              <CardHeader>
                <CardTitle>Haftanın Kadrosu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Kadro Ekle */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Yeni Kadro Ekle</h3>
                  <div className="space-y-4">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Hafta"
                      value={totwWeek}
                      onChange={(e) => setTotwWeek(e.target.value)}
                    />
                    <div className="space-y-2">
                      <Label>Kadro Görseli</Label>
                      {totwImage ? (
                        <div className="relative inline-block">
                          <img 
                            src={totwImage} 
                            alt="Team of Week" 
                            className="max-w-full h-auto rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => setTotwImage("")}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, setTotwImage)}
                            className="max-w-xs"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const inputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
                              inputs[inputs.length - 1]?.click();
                            }}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        if (totwWeek && totwImage) {
                          createTotwMutation.mutate({
                            week: parseInt(totwWeek),
                            image: totwImage,
                          });
                        }
                      }}
                      disabled={!totwWeek || !totwImage || createTotwMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Kadro Ekle
                    </Button>
                  </div>
                </div>

                {/* Kadrolar Listesi */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Mevcut Kadrolar</h3>
                  <div className="space-y-3">
                    {teamsOfWeek?.map((totw: any) => (
                      <div key={totw.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium">Hafta {totw.week}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Bu kadroyu silmek istediğinizden emin misiniz?")) {
                                deleteTotwMutation.mutate(totw.id);
                              }
                            }}
                            disabled={deleteTotwMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <img 
                          src={totw.image} 
                          alt={`Hafta ${totw.week}`} 
                          className="max-w-full h-auto rounded-md border"
                        />
                      </div>
                    ))}
                    {!teamsOfWeek?.length && (
                      <p className="text-center text-muted-foreground py-4">Henüz kadro eklenmedi</p>
                    )}
                  </div>
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
