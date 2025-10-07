import Header from '../Header'

export default function HeaderExample() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-4">Logged out state</p>
        <Header />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-4">Logged in as regular user</p>
        <Header user={{ username: "oyuncu123" }} onLogout={() => console.log('Logout clicked')} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-4">Logged in as admin</p>
        <Header user={{ username: "alwes1", isAdmin: true }} onLogout={() => console.log('Logout clicked')} />
      </div>
    </div>
  )
}
