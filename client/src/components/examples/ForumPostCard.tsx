import ForumPostCard from '../ForumPostCard'

export default function ForumPostCardExample() {
  return (
    <div className="space-y-4 max-w-3xl">
      <ForumPostCard
        id={1}
        title="Yeni sezon başlıyor! Katılmak isteyen var mı?"
        content="Merhaba arkadaşlar, yeni sezon için takım arıyorum. İyi bir savunma oyuncusuyum ve aktif olarak oynuyorum."
        author="futbolsever42"
        category="Genel Sohbet"
        replyCount={12}
        createdAt="2 saat önce"
      />
      <ForumPostCard
        id={2}
        title="Takım başvurusu - Beşiktaş Espor"
        content="Takımımızın logosu ve kadrosu hazır. Lig için başvurmak istiyoruz."
        author="bjk_admin"
        category="Takım Başvuruları"
        replyCount={3}
        createdAt="5 saat önce"
        isLocked={true}
        showAdminActions={true}
        onDelete={() => console.log('Delete clicked')}
        onToggleLock={() => console.log('Toggle lock clicked')}
      />
      <ForumPostCard
        id={3}
        title="Geçen sezonun en iyi maçı"
        content="Galatasaray - Fenerbahçe final maçı gerçekten harikaydı. Son dakika golü..."
        author="eskioyuncu"
        category="Sözlük"
        replyCount={45}
        createdAt="1 gün önce"
        isArchived={true}
      />
    </div>
  )
}
