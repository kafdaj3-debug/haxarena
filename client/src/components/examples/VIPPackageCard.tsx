import VIPPackageCard from '../VIPPackageCard'

export default function VIPPackageCardExample() {
  const silverFeatures = [
    "Pub odalarında VIP TAGI ve VIP emojisi",
    "Mesajlar kalın yazı ile görünür",
    "60+ karakter mesajlarda uyarı yemez",
    "Gol/asist sonrası büyüme efekti",
    "Maç sonu istatistiklerde yazı yazabilir",
    "6 saniyelik yazı engelinden etkilenmez",
    "VIP üyelere özel çekilişlere katılabilir",
    "Eğlence turnuvaları ve odalarına katılabilir"
  ];

  const goldFeatures = [
    "Discord'a 5 özel emoji ekletebilir",
    "Yavaş mod daha az etkiler",
    "Erken '!vote' kullanabilir",
    "3 maç AFK kalma hakkı",
    "'!vipstil' ile yazı stilini değiştirebilir",
    "Dolu odalara (16/17 kişi) girebilir",
    "Makul ek ücret ile yazı renklerini değiştirebilirler"
  ];

  const diamondFeatures = [
    "'!avatar' ile hareketli avatar + hız ayarı",
    "Dizilim başlamadan '!değiş' komutu",
    "'!afk' ile spec'e geçme hakkı",
    "'!adminvip' ile admin olabilir (admin yokken)",
    "'!p' komutu ile 10 saniye oyunu durdurabilir",
    "Tüm VIP özelliklerine erişim hakkı"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
      <VIPPackageCard
        tier="silver"
        price={90}
        features={silverFeatures}
        purchaseLink="https://www.shopier.com/40044747"
      />
      <VIPPackageCard
        tier="gold"
        price={120}
        features={goldFeatures}
        purchaseLink="https://www.shopier.com/40044867"
      />
      <VIPPackageCard
        tier="diamond"
        price={150}
        features={diamondFeatures}
        purchaseLink="https://www.shopier.com/40051776"
        showDiscordWarning={true}
      />
    </div>
  )
}
