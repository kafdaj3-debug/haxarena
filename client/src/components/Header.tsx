import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiDiscord } from "react-icons/si";
import { UserCircle, LogOut, Shield } from "lucide-react";

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
          <Link href="/takim-basvuru" data-testid="link-nav-team-application">
            <Button variant="ghost" className="hover-elevate active-elevate-2">
              Takım Başvurusu
            </Button>
          </Link>
          <Link href="/forum" data-testid="link-nav-forum">
            <Button variant="ghost" className="hover-elevate active-elevate-2">
              Forum
            </Button>
          </Link>
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
        </nav>

        <div className="flex items-center gap-2">
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
