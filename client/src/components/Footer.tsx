import { Link } from "wouter";
import { Home, Users, Trophy, MessageSquare, Shield, Mail, FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Hızlı Linkler */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm hover-elevate py-1 px-2 rounded-md -ml-2">
                  <Home className="w-4 h-4" />
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm hover-elevate py-1 px-2 rounded-md -ml-2">
                  <MessageSquare className="w-4 h-4" />
                  Forum
                </Link>
              </li>
              <li>
                <Link href="/statistics" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm hover-elevate py-1 px-2 rounded-md -ml-2">
                  <Trophy className="w-4 h-4" />
                  Leaderboards
                </Link>
              </li>
              <li>
                <Link href="/vip" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm hover-elevate py-1 px-2 rounded-md -ml-2">
                  <Shield className="w-4 h-4" />
                  VIP Paketi
                </Link>
              </li>
              <li>
                <Link href="/lig" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm hover-elevate py-1 px-2 rounded-md -ml-2">
                  <FileText className="w-4 h-4" />
                  Lig
                </Link>
              </li>
            </ul>
          </div>

          {/* Sitede Bulunanlar */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Sitede Bulunanlar</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Canlı Sohbet Sistemi
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Oyuncu İstatistikleri
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                VIP Üyelik Sistemi
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Takım Başvuru Sistemi
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Forum & Topluluk
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Özel Mesajlaşma
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Lig Sistemi
              </li>
            </ul>
          </div>

          {/* Topluluk & İletişim */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Topluluk</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://discord.gg/haxarena" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm hover-elevate py-1 px-2 rounded-md -ml-2"
                >
                  <Users className="w-4 h-4" />
                  Discord Sunucusu
                </a>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm hover-elevate py-1 px-2 rounded-md -ml-2">
                  <Users className="w-4 h-4" />
                  Profilim
                </Link>
              </li>
              <li>
                <Link href="/messages" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm hover-elevate py-1 px-2 rounded-md -ml-2">
                  <Mail className="w-4 h-4" />
                  Mesajlar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Founder Section */}
        <div className="mt-8 pt-6 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Kurucular
            </p>
            <p className="text-lg font-bold text-primary">
              Alves & Luné
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HaxArena V6 Real Soccer. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
