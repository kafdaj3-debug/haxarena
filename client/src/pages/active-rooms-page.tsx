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
      matchName: "Galatasaray vs Fenerbahçe",
      link: "https://www.haxball.com/play?c=ypTYXP0WvG4",
      isActive: true
    },
    {
      id: 2,
      matchName: "Karşıyaka vs Göztepe",
      link: "https://www.haxball.com/play?c=ZkcM_hKao5I",
      isActive: true
    },
    {
      id: 3,
      matchName: "Kocaelispor vs Gaziantepspor",
      link: "https://www.haxball.com/play?c=NOeHL2fPZ1o",
      isActive: true
    }
  ]);

  const [preparationRooms] = useState([
    {
      id: 1,
      matchName: "HaxArena Hazırlık Odası 1",
      link: "https://www.haxball.com/play?c=wqcQAOMDnVE",
      isActive: true
    },
    {
      id: 2,
      matchName: "HaxArena Hazırlık Odası 2",
      link: "https://www.haxball.com/play?c=TOVMlpm27eE",
      isActive: true
    },
    {
      id: 3,
      matchName: "HaxArena Hazırlık Odası 3",
      link: "https://www.haxball.com/play?c=XYTmREWQVcE",
      isActive: true
    },
    {
      id: 4,
      matchName: "HaxArena Hazırlık Odası 4",
      link: "https://www.haxball.com/play?c=Dvp_81Dn9wc",
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

          {/* Aktif Odalar */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">Maç Odaları</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
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

          {/* Hazırlık Odaları */}
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">Hazırlık Odaları</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {preparationRooms.map((room) => (
                <ActiveRoomCard
                  key={room.id}
                  matchName={room.matchName}
                  link={room.link}
                  isActive={room.isActive}
                />
              ))}
            </div>
            {preparationRooms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Şu anda hazırlık odası bulunmamaktadır.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
