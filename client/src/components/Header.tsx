import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SiDiscord } from "react-icons/si";
import { UserCircle, LogOut, Shield, Bell, Trash2, Menu } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface HeaderProps {
  user?: { 
    username: string; 
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    role?: string;
  } | null;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: notifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    refetchInterval: 30000, // Her 30 saniyede bir yenile
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/notifications/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <div className="flex items-center gap-2 hover-elevate rounded-lg px-3 py-2 active-elevate-2 cursor-pointer" data-testid="link-home">
            <div className="text-2xl font-heading font-bold text-primary">
              HaxArena V6
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <Link href="/" data-testid="link-nav-home">
            <Button variant="ghost" className="hover-elevate active-elevate-2">
              Ana Sayfa
            </Button>
          </Link>
          <Link href="/aktif-odalar" data-testid="link-nav-rooms">
            <Button variant="ghost" className="hover-elevate active-elevate-2">
              Aktif Odalar
            </Button>
          </Link>
          <Link href="/vip" data-testid="link-nav-vip">
            <Button variant="ghost" className="hover-elevate active-elevate-2">
              VIP
            </Button>
          </Link>
          <Link href="/lig" data-testid="link-nav-league">
            <Button variant="ghost" className="hover-elevate active-elevate-2">
              Lig
            </Button>
          </Link>
          <Link href="/forum" data-testid="link-nav-forum">
            <Button variant="ghost" className="hover-elevate active-elevate-2">
              Forum
            </Button>
          </Link>
          {user && (
            <Link href="/mesajlar" data-testid="link-nav-messages">
              <Button variant="ghost" className="hover-elevate active-elevate-2">
                Mesajlar
              </Button>
            </Link>
          )}
          <Link href="/admin-kadrosu" data-testid="link-nav-staff">
            <Button variant="ghost" className="hover-elevate active-elevate-2">
              Admin Kadrosu
            </Button>
          </Link>
          <Link href="/admin-basvuru" data-testid="link-nav-admin-application">
            <Button variant="ghost" className="hover-elevate active-elevate-2">
              Admin Başvurusu
            </Button>
          </Link>
          <Link href="/takim-basvuru" data-testid="link-nav-team-application">
            <Button variant="ghost" className="hover-elevate active-elevate-2">
              Takım Başvurusu
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobil Menü Butonu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="hover-elevate active-elevate-2" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-home">
                  <Button variant="ghost" className="w-full justify-start hover-elevate active-elevate-2">
                    Ana Sayfa
                  </Button>
                </Link>
                <Link href="/aktif-odalar" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-rooms">
                  <Button variant="ghost" className="w-full justify-start hover-elevate active-elevate-2">
                    Aktif Odalar
                  </Button>
                </Link>
                <Link href="/vip" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-vip">
                  <Button variant="ghost" className="w-full justify-start hover-elevate active-elevate-2">
                    VIP
                  </Button>
                </Link>
                <Link href="/lig" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-league">
                  <Button variant="ghost" className="w-full justify-start hover-elevate active-elevate-2">
                    Lig
                  </Button>
                </Link>
                <Link href="/forum" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-forum">
                  <Button variant="ghost" className="w-full justify-start hover-elevate active-elevate-2">
                    Forum
                  </Button>
                </Link>
                {user && (
                  <Link href="/mesajlar" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-messages">
                    <Button variant="ghost" className="w-full justify-start hover-elevate active-elevate-2">
                      Mesajlar
                    </Button>
                  </Link>
                )}
                <Link href="/admin-kadrosu" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-staff">
                  <Button variant="ghost" className="w-full justify-start hover-elevate active-elevate-2">
                    Admin Kadrosu
                  </Button>
                </Link>
                <Link href="/admin-basvuru" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-admin-application">
                  <Button variant="ghost" className="w-full justify-start hover-elevate active-elevate-2">
                    Admin Başvurusu
                  </Button>
                </Link>
                <Link href="/takim-basvuru" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-team-application">
                  <Button variant="ghost" className="w-full justify-start hover-elevate active-elevate-2">
                    Takım Başvurusu
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <a
            href="https://discord.gg/haxarena"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-discord"
          >
            <Button variant="ghost" size="icon" className="hover-elevate active-elevate-2">
              <SiDiscord className="w-5 h-5" />
            </Button>
          </a>
          
          {user ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover-elevate active-elevate-2 relative"
                    data-testid="button-notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Bildirimler</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications && notifications.length > 0 ? (
                      <div className="divide-y">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-3 flex items-start justify-between gap-2 ${!notif.read ? 'bg-muted/50' : ''}`}
                          >
                            <p className="text-sm flex-1">{notif.message}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotificationMutation.mutate(notif.id)}
                              disabled={deleteNotificationMutation.isPending}
                              data-testid={`button-delete-notification-${notif.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Bildirim yok
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <Link href="/profil" data-testid="link-profile">
                <Button variant="ghost" className="hover-elevate active-elevate-2 flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  <span className="hidden md:inline">{user.username}</span>
                  {user.role && (
                    <Badge variant="secondary" className="hidden md:inline-flex">
                      {user.role}
                    </Badge>
                  )}
                </Button>
              </Link>
              {user.isSuperAdmin && (
                <Link href="/yonetim" data-testid="link-management">
                  <Button variant="default" size="sm" className="hover-elevate active-elevate-2">
                    <Shield className="w-4 h-4 mr-1" />
                    Yönetim
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onLogout}
                className="hover-elevate active-elevate-2"
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/kayit" data-testid="link-register">
                <Button variant="ghost" className="hover-elevate active-elevate-2">
                  Kayıt Ol
                </Button>
              </Link>
              <Link href="/giris" data-testid="link-login">
                <Button variant="default" className="hover-elevate active-elevate-2">
                  Giriş Yap
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
