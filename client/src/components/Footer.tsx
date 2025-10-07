import { Link } from "wouter";
import { Users } from "lucide-react";

interface FooterProps {
  onlineCount?: number;
}

export default function Footer({ onlineCount = 0 }: FooterProps) {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading font-bold text-lg mb-4 text-primary">
              HaxArena V6
            </h3>
            <p className="text-sm text-muted-foreground">
              Türkiye'nin en büyük HaxBall Real Soccer topluluğu
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/aktif-odalar" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-rooms">
                  Aktif Odalar
                </Link>
              </li>
              <li>
                <Link href="/vip" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-vip">
                  VIP Üyelik
                </Link>
              </li>
              <li>
                <Link href="/lig" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-league">
                  Lig
                </Link>
              </li>
              <li>
                <a 
                  href="https://discord.gg/haxarena" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-discord"
                >
                  Discord Sunucumuz
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Çevrimiçi Kullanıcılar
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm" data-testid="text-online-count">
                {onlineCount} kullanıcı aktif
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 HaxArena V6. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
