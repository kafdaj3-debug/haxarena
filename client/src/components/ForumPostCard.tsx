import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lock, Trash2 } from "lucide-react";
import { Link } from "wouter";

interface ForumPostCardProps {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  replyCount: number;
  createdAt: string;
  isLocked?: boolean;
  isArchived?: boolean;
  showAdminActions?: boolean;
  onDelete?: () => void;
  onToggleLock?: () => void;
}

export default function ForumPostCard({
  id,
  title,
  content,
  author,
  category,
  replyCount,
  createdAt,
  isLocked = false,
  isArchived = false,
  showAdminActions = false,
  onDelete,
  onToggleLock,
}: ForumPostCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={`hover-elevate overflow-visible ${isArchived ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback data-testid={`avatar-${author}`}>{getInitials(author)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link href={`/konu/${id}`}>
                  <a className="font-semibold hover:text-primary transition-colors" data-testid={`link-post-${id}`}>
                    {title}
                  </a>
                </Link>
                {isLocked && (
                  <Badge variant="secondary" className="gap-1" data-testid="badge-locked">
                    <Lock className="w-3 h-3" />
                    Kilitli
                  </Badge>
                )}
                {isArchived && (
                  <Badge variant="secondary" data-testid="badge-archived">
                    Arşivlendi
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <span data-testid="text-author">{author}</span> • <span data-testid="text-category">{category}</span> • {createdAt}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2" data-testid="text-content">
          {content}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="w-4 h-4" />
          <span data-testid="text-reply-count">{replyCount} yanıt</span>
        </div>

        {showAdminActions && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleLock}
              className="hover-elevate active-elevate-2"
              data-testid="button-toggle-lock"
            >
              <Lock className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="hover-elevate active-elevate-2 text-destructive"
              data-testid="button-delete-post"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
