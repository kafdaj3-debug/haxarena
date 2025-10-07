import AdminStaffList from '../AdminStaffList'

export default function AdminStaffListExample() {
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
    "Arena Admin": [],
    "Coordinator Admin": [],
    "Head Overseer Admin": [],
    "Inspector Admin": []
  };

  return (
    <AdminStaffList
      staffByRole={staffByRole}
      roles={roles}
      isEditable={true}
      onEdit={(id) => console.log('Edit staff', id)}
      onAdd={(role) => console.log('Add to role', role)}
    />
  )
}
