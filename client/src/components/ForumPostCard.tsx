import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lock, Trash2 } from "lucide-react";
import { Link } from "wouter";

interface ForumPostCardProps {
  id: number;
  title: string;
  content: string;
  author: string;
  authorProfilePicture?: string | null;
  authorRole?: string;
  authorPlayerRole?: string;
  authorIsAdmin?: boolean;
  authorIsSuperAdmin?: boolean;
  category: string;
  replyCount: number;
  createdAt: string;
  isLocked?: boolean;
  isArchived?: boolean;
  showAdminActions?: boolean;
  onDelete?: () => void;
  onToggleLock?: () => void;
}

const roleColors: Record<string, string> = {
  "Founder": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Master Coordinator": "bg-red-500/20 text-red-300 border-red-500/30",
  "Coordinator Admin": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Head Overseer Admin": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Inspector Admin": "bg-green-500/20 text-green-300 border-green-500/30",
  "Game Admin": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Arena Admin": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "HaxArena Üye": "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function ForumPostCard({
  id,
  title,
  content,
  author,
  authorProfilePicture,
  authorRole,
  authorPlayerRole,
  authorIsAdmin,
  authorIsSuperAdmin,
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

  // Admin rolleri (öncelikli)
  const adminRoles = ["Founder", "Master Coordinator", "Coordinator Admin", "Head Overseer Admin", "Inspector Admin", "Game Admin", "Arena Admin"];
  const isAdminRole = authorRole && adminRoles.includes(authorRole);

  return (
    <Card className={`hover-elevate overflow-visible ${isArchived ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-primary/20">
              <AvatarImage src={authorProfilePicture || undefined} alt={author} />
              <AvatarFallback data-testid={`avatar-${author}`}>{getInitials(author)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-base font-bold text-foreground" data-testid="text-author">{author}</span>
                
                {/* Yönetim etiketi (en öncelikli) */}
                {authorIsSuperAdmin && (
                  <Badge 
                    variant="outline" 
                    className="bg-red-500/20 text-red-300 border-red-500/30 text-xs font-bold"
                    data-testid="badge-management"
                  >
                    YÖNETİM
                  </Badge>
                )}
                
                {/* Admin/Staff rolü */}
                {authorRole && isAdminRole && (
                  <Badge 
                    variant="outline" 
                    className={`${roleColors[authorRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                    data-testid="badge-author-role"
                  >
                    {authorRole}
                  </Badge>
                )}
                
                {/* Oyuncu rolü (admin rolünden sonra) */}
                {authorPlayerRole && (
                  <Badge 
                    variant="outline" 
                    className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs"
                    data-testid="badge-author-player-role"
                  >
                    {authorPlayerRole}
                  </Badge>
                )}
                
                {/* Normal üye rolü (eğer admin rolü yoksa) */}
                {authorRole && !isAdminRole && (
                  <Badge 
                    variant="outline" 
                    className={`${roleColors[authorRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                    data-testid="badge-author-role"
                  >
                    {authorRole}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link href={`/forum/${id}`} className="font-semibold text-lg hover:text-primary transition-colors" data-testid={`link-post-${id}`}>
                  {title}
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
              <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                <span>{createdAt}</span>
                <span>•</span>
                <span data-testid="text-category">{category}</span>
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
