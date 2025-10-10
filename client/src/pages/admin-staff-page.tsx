import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminStaffList from "@/components/AdminStaffList";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import type { StaffRole } from "@shared/schema";

export default function AdminStaffPage() {
  const { user, logout } = useAuth();
  
  const { data: staffRoles, isLoading } = useQuery<StaffRole[]>({
    queryKey: ["/api/staff-roles"],
  });

  const roles = [
    "Founder",
    "Master Coordinator",
    "Coordinator Admin",
    "Head Overseer Admin",
    "Inspector Admin",
    "Game Admin",
    "Arena Admin"
  ];

  // Group staff members by role
  const staffByRole = roles.reduce((acc, role) => {
    acc[role] = staffRoles?.filter(staff => staff.role === role).map((staff, index) => ({
      id: index,
      name: staff.name,
      role: staff.role
    })) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
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

          {isLoading ? (
            <p className="text-center text-muted-foreground">Yükleniyor...</p>
          ) : (
            <AdminStaffList
              staffByRole={staffByRole}
              roles={roles}
              isEditable={false}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
