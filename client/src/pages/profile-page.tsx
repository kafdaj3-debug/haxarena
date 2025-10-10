import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MessageSquare, FileText, Trophy, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, logout } = useAuth();

  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/users", userId, "profile"],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={currentUser} onLogout={logout} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-48 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={currentUser} onLogout={logout} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Kullanıcı bulunamadı</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const { user, forumPostCount, chatMessageCount, teamApplications, adminApplications } = profile;

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={currentUser} onLogout={logout} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl flex items-center gap-3" data-testid="text-profile-username">
                  {user.username}
                  <div className="flex gap-2">
                    {(user.isAdmin || user.isSuperAdmin) && (
                      <Badge variant="default" data-testid="badge-admin-role">
                        {user.isSuperAdmin ? "YÖNETİM" : "Admin"}
                      </Badge>
                    )}
                    {user.playerRole && (
                      <Badge variant="outline" data-testid="badge-player-role">
                        {user.playerRole}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4" />
                  {user.createdAt && formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: tr })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Forum Gönderi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold" data-testid="text-forum-count">{forumPostCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chat Mesajı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold" data-testid="text-chat-count">{chatMessageCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Takım Başvuru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold" data-testid="text-team-apps-count">{teamApplications.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admin Başvuru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold" data-testid="text-admin-apps-count">{adminApplications.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {teamApplications.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Takım Başvuruları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamApplications.map((app: any) => (
                  <div key={app.id} className="p-4 border rounded-lg" data-testid={`team-app-${app.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{app.teamName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: tr })}
                        </p>
                      </div>
                      <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "outline"}>
                        {app.status === "approved" ? "Onaylandı" : app.status === "rejected" ? "Reddedildi" : "Bekliyor"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {adminApplications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Başvuruları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminApplications.map((app: any) => (
                  <div key={app.id} className="p-4 border rounded-lg" data-testid={`admin-app-${app.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: tr })}
                        </p>
                      </div>
                      <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "outline"}>
                        {app.status === "approved" ? "Onaylandı" : app.status === "rejected" ? "Reddedildi" : "Bekliyor"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
