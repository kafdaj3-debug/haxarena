import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminStaffList from "@/components/AdminStaffList";

export default function AdminStaffPage() {
  const roles = [
    "Founder",
    "Master Coordinator",
    "Coordinator Admin",
    "Head Overseer Admin",
    "Inspector Admin",
    "Game Admin",
    "Arena Admin"
  ];

  const staffByRole = {
    "Founder": [
      { id: 1, name: "alwes1", role: "Founder" }
    ],
    "Master Coordinator": [
      { id: 2, name: "Moderator1", role: "Master Coordinator" },
      { id: 3, name: "Moderator2", role: "Master Coordinator" }
    ],
    "Game Admin": [
      { id: 4, name: "GameAdmin1", role: "Game Admin" },
      { id: 5, name: "GameAdmin2", role: "Game Admin" },
      { id: 6, name: "GameAdmin3", role: "Game Admin" }
    ],
    "Arena Admin": [
      { id: 7, name: "ArenaAdmin1", role: "Arena Admin" }
    ],
    "Coordinator Admin": [],
    "Head Overseer Admin": [
      { id: 8, name: "Overseer1", role: "Head Overseer Admin" }
    ],
    "Inspector Admin": []
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-4" data-testid="text-page-title">
              Admin Kadrosu
            </h1>
            <p className="text-muted-foreground">
              HaxArena V6 yönetim ekibimiz ve görevlileri
            </p>
          </div>

          <AdminStaffList
            staffByRole={staffByRole}
            roles={roles}
            isEditable={false}
          />
        </div>
      </main>

      <Footer onlineCount={42} />
    </div>
  );
}
