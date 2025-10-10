import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActiveRoomCard from "@/components/ActiveRoomCard";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function ActiveRoomsPage() {
  const { user, logout } = useAuth();
  const [rooms] = useState([
    {
      id: 1,
      matchName: "Beşiktaş vs Trabzonspor",
      link: "https://www.haxball.com/play?c=S94fRiqX_MI",
      isActive: true
    },
    {
      id: 2,
      matchName: "Kocaelispor vs Gaziantepspor",
      link: "https://www.haxball.com/play?c=SQiZbOZdvCU",
      isActive: true
    },
    {
      id: 3,
      matchName: "Karşıyaka vs Göztepe",
      link: "https://www.haxball.com/play?c=0nc3iNzdT78",
      isActive: true
    },
    {
      id: 4,
      matchName: "Galatasaray vs Fenerbahçe",
      link: "https://www.haxball.com/play?c=tIJcy9L3c0k",
      isActive: true
    }
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-4" data-testid="text-page-title">
              Aktif Odalar
            </h1>
            <p className="text-muted-foreground">
              Şu anda aktif olan tüm oyun odalarını görebilir ve katılabilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <ActiveRoomCard
                key={room.id}
                matchName={room.matchName}
                link={room.link}
                isActive={room.isActive}
              />
            ))}
          </div>

          {rooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg" data-testid="text-no-rooms">
                Şu anda aktif oda bulunmamaktadır.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
