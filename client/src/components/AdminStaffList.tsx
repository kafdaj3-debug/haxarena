import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";

interface StaffMember {
  id: number;
  name: string;
  role: string;
}

interface AdminStaffListProps {
  staffByRole: Record<string, StaffMember[]>;
  roles: string[];
  onEdit?: (memberId: number) => void;
  onAdd?: (role: string) => void;
  isEditable?: boolean;
}

const roleColors: Record<string, string> = {
  "Founder": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Master Coordinator": "bg-red-500/20 text-red-300 border-red-500/30",
  "Coordinator Admin": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Head Overseer Admin": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Inspector Admin": "bg-green-500/20 text-green-300 border-green-500/30",
  "Game Admin": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Arena Admin": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

export default function AdminStaffList({ 
  staffByRole, 
  roles, 
  onEdit, 
  onAdd,
  isEditable = false 
}: AdminStaffListProps) {
  return (
    <div className="space-y-6">
      {roles.map((role) => (
        <Card key={role}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg" data-testid={`text-role-${role}`}>
                {role}
              </CardTitle>
              {isEditable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAdd?.(role)}
                  className="hover-elevate active-elevate-2"
                  data-testid={`button-add-${role}`}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {staffByRole[role]?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {staffByRole[role].map((member) => (
                  <div key={member.id} className="flex items-center gap-2 group">
                    <Badge 
                      variant="outline" 
                      className={`${roleColors[role] || ''} hover-elevate`}
                      data-testid={`badge-staff-${member.id}`}
                    >
                      {member.name}
                    </Badge>
                    {isEditable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity hover-elevate active-elevate-2"
                        onClick={() => onEdit?.(member.id)}
                        data-testid={`button-edit-${member.id}`}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid={`text-empty-${role}`}>
                Henüz eklenmiş yetkili yok
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
