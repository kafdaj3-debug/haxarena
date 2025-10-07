import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Star, Gem } from "lucide-react";

interface VIPPackageCardProps {
  tier: "silver" | "gold" | "diamond";
  price: number;
  features: string[];
  purchaseLink: string;
  showDiscordWarning?: boolean;
}

const tierConfig = {
  silver: {
    icon: Shield,
    label: "SILVER VIP",
    color: "text-gray-400",
    badgeVariant: "secondary" as const,
  },
  gold: {
    icon: Star,
    label: "GOLD VIP",
    color: "text-yellow-500",
    badgeVariant: "default" as const,
  },
  diamond: {
    icon: Gem,
    label: "DIAMOND VIP",
    color: "text-blue-400",
    badgeVariant: "default" as const,
  },
};

export default function VIPPackageCard({ 
  tier, 
  price, 
  features, 
  purchaseLink,
  showDiscordWarning = false 
}: VIPPackageCardProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <Card className="hover-elevate overflow-visible flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant={config.badgeVariant} className="gap-1" data-testid={`badge-vip-${tier}`}>
            <Icon className="w-4 h-4" />
            {config.label}
          </Badge>
        </div>
        <CardTitle className="text-3xl font-bold" data-testid={`text-price-${tier}`}>
          {price} TL
        </CardTitle>
        <CardDescription>Aylık Ödeme</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span data-testid={`text-feature-${tier}-${index}`}>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <a href={purchaseLink} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full hover-elevate active-elevate-2" data-testid={`button-purchase-${tier}`}>
            Satın Al
          </Button>
        </a>
        {showDiscordWarning && (
          <p className="text-xs text-muted-foreground text-center" data-testid="text-discord-warning">
            Satın aldıktan sonra Discord'dan ticket açıp sipariş kodunuzu iletiniz.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
