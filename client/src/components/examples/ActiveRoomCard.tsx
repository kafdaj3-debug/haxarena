import ActiveRoomCard from '../ActiveRoomCard'

export default function ActiveRoomCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <ActiveRoomCard
        matchName="Beşiktaş vs Trabzonspor"
        link="https://www.haxball.com/play?c=S94fRiqX_MI"
        isActive={true}
      />
      <ActiveRoomCard
        matchName="Galatasaray vs Fenerbahçe"
        link="https://www.haxball.com/play?c=tIJcy9L3c0k"
        isActive={true}
        showEditButton={true}
        onEdit={() => console.log('Edit clicked')}
      />
    </div>
  )
}
