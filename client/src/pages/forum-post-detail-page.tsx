import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Archive, Lock as LockIcon, MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ForumPost, ForumReply, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const roleColors: Record<string, string> = {
  "Founder": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Master Coordinator": "bg-red-500/20 text-red-300 border-red-500/30",
  "Coordinator Admin": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Head Overseer Admin": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Inspector Admin": "bg-green-500/20 text-green-300 border-green-500/30",
  "Game Admin": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Arena Admin": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

type PostWithUser = ForumPost & { user: User };
type ReplyWithUser = ForumReply & { user: User };

export default function ForumPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState("");

  const { data: post, isLoading: postLoading } = useQuery<PostWithUser>({
    queryKey: ["/api/forum-posts", id],
    queryFn: async () => {
      const response = await fetch(`/api/forum-posts/${id}`);
      if (!response.ok) throw new Error("Konu yüklenemedi");
      return response.json();
    },
  });

  const { data: replies, isLoading: repliesLoading } = useQuery<ReplyWithUser[]>({
    queryKey: ["/api/forum-posts", id, "replies"],
    queryFn: async () => {
      const response = await fetch(`/api/forum-posts/${id}/replies`);
      if (!response.ok) throw new Error("Cevaplar yüklenemedi");
      return response.json();
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/forum-posts/${id}/replies`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts", id, "replies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      toast({
        title: "Başarılı",
        description: "Cevabınız eklendi",
      });
      setReplyContent("");
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Cevap eklenemedi",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/forum-posts/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Konu silindi",
      });
      navigate("/forum");
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Konu silinemedi",
        variant: "destructive",
      });
    },
  });

  const archivePostMutation = useMutation({
    mutationFn: async (archived: boolean) => {
      return await apiRequest("PATCH", `/api/forum-posts/${id}`, { isArchived: archived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      toast({
        title: "Başarılı",
        description: post?.isArchived ? "Arşivden çıkarıldı" : "Arşivlendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İşlem başarısız",
        variant: "destructive",
      });
    },
  });

  const handleReplySubmit = () => {
    if (!replyContent.trim()) {
      toast({
        title: "Hata",
        description: "Cevap içeriği boş olamaz",
        variant: "destructive",
      });
      return;
    }
    createReplyMutation.mutate(replyContent);
  };

  if (postLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={user} onLogout={logout} />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <p className="text-center text-muted-foreground">Yükleniyor...</p>
          </div>
        </main>
        <Footer onlineCount={42} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={user} onLogout={logout} />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <p className="text-center text-muted-foreground">Konu bulunamadı</p>
          </div>
        </main>
        <Footer onlineCount={42} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/forum")}
            className="mb-6"
            data-testid="button-back-to-forum"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Foruma Dön
          </Button>

          <Card className="mb-6" data-testid="card-post-detail">
            <CardHeader>
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                    {post.category}
                  </span>
                  {post.isLocked && (
                    <span className="text-xs px-2 py-1 rounded-md bg-orange-500/10 text-orange-500 font-medium flex items-center gap-1">
                      <LockIcon className="w-3 h-3" />
                      Kilitli
                    </span>
                  )}
                  {post.isArchived && (
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium flex items-center gap-1">
                      <Archive className="w-3 h-3" />
                      Arşivlendi
                    </span>
                  )}
                </div>
                {user && post.userId === user.id && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => archivePostMutation.mutate(!post.isArchived)}
                      disabled={archivePostMutation.isPending}
                      data-testid="button-archive-post"
                    >
                      <Archive className="w-4 h-4 mr-1" />
                      {post.isArchived ? "Arşivden Çıkar" : "Arşivle"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePostMutation.mutate()}
                      disabled={deletePostMutation.isPending}
                      className="text-destructive"
                      data-testid="button-delete-post"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Sil
                    </Button>
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-heading font-bold mb-3" data-testid="text-post-title">
                {post.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                </span>
                <span>•</span>
                <span data-testid="text-post-author">{post.user.username}</span>
                {post.user.role && post.user.role !== "HaxArena Üye" && (
                  <Badge 
                    variant="outline" 
                    className={`${roleColors[post.user.role] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                  >
                    {post.user.role}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground" data-testid="text-post-content">
                {post.content}
              </p>
            </CardContent>
          </Card>

          {post.isLocked ? (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <LockIcon className="w-8 h-8 mx-auto mb-2" />
                  <p>Bu konu kilitlenmiştir. Yeni cevap eklenemez.</p>
                </div>
              </CardContent>
            </Card>
          ) : user ? (
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Cevap Yaz</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Cevabınızı yazın..."
                  rows={4}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  data-testid="textarea-reply-content"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleReplySubmit}
                    disabled={createReplyMutation.isPending || !replyContent.trim()}
                    data-testid="button-submit-reply"
                  >
                    {createReplyMutation.isPending ? "Gönderiliyor..." : "Cevap Gönder"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>Cevap yazmak için giriş yapmanız gerekmektedir.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Cevaplar ({replies?.length || 0})
            </h3>

            {repliesLoading ? (
              <p className="text-center text-muted-foreground">Yükleniyor...</p>
            ) : replies && replies.length > 0 ? (
              replies.map((reply) => (
                <Card key={reply.id} data-testid={`card-reply-${reply.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                      <span className="font-medium" data-testid={`text-reply-author-${reply.id}`}>
                        {reply.user.username}
                      </span>
                      {reply.user.role && reply.user.role !== "HaxArena Üye" && (
                        <Badge 
                          variant="outline" 
                          className={`${roleColors[reply.user.role] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                        >
                          {reply.user.role}
                        </Badge>
                      )}
                      <span>•</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: tr })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-muted-foreground" data-testid={`text-reply-content-${reply.id}`}>
                      {reply.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground" data-testid="text-no-replies">
                    Henüz cevap bulunmamaktadır. İlk cevabı siz yazın!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer onlineCount={42} />
    </div>
  );
}
