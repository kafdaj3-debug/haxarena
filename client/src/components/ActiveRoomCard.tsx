import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pencil } from "lucide-react";

interface ActiveRoomCardProps {
  matchName: string;
  link: string;
  isActive?: boolean;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export default function ActiveRoomCard({ 
  matchName, 
  link, 
  isActive = true, 
  onEdit,
  showEditButton = false 
}: ActiveRoomCardProps) {
  return (
    <Card className="border-l-4 border-l-primary relative hover-elevate overflow-visible">
      {showEditButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 w-8 h-8 hover-elevate active-elevate-2"
          onClick={onEdit}
          data-testid="button-edit-room"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      )}
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" data-testid="indicator-room-active" />
          )}
          <span data-testid="text-room-name">{matchName}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <a href={link} target="_blank" rel="noopener noreferrer">
          <Button className="w-full hover-elevate active-elevate-2" data-testid="button-join-room">
            <ExternalLink className="w-4 h-4 mr-2" />
            Odaya Katıl
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
