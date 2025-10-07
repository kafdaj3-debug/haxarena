import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SiDiscord } from "react-icons/si";
import { UserCircle, LogOut } from "lucide-react";

interface HeaderProps {
  user?: { username: string; isAdmin?: boolean } | null;
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

        <nav className="hidden md:flex items-center gap-1">
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
                <Button variant="ghost" size="icon" className="hover-elevate active-elevate-2">
                  <UserCircle className="w-5 h-5" />
                </Button>
              </Link>
              {user.isAdmin && (
                <Link href="/admin" data-testid="link-admin">
                  <Button variant="default" size="sm" className="hover-elevate active-elevate-2">
                    Admin Panel
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
            <Link href="/auth" data-testid="link-login">
              <Button variant="default" className="hover-elevate active-elevate-2">
                Giriş Yap
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
