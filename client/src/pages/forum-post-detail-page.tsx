import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Archive, Lock as LockIcon, MessageSquare, Trash2, Quote, Image as ImageIcon, X, Edit } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ForumPost, ForumReply, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const roleColors: Record<string, string> = {
  "Founder": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Master Coordinator": "bg-red-500/20 text-red-300 border-red-500/30",
  "Coordinator Admin": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Head Overseer Admin": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Inspector Admin": "bg-green-500/20 text-green-300 border-green-500/30",
  "Game Admin": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Arena Admin": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

type PostWithUser = ForumPost & { user: User; staffRole?: string | null };
type ReplyWithUser = ForumReply & { user: User; staffRole?: string | null };

export default function ForumPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState("");
  const [replyImageUrl, setReplyImageUrl] = useState<string | null>(null);
  const [quotedReplyId, setQuotedReplyId] = useState<string | null>(null);
  
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Görsel boyutu 5MB'dan küçük olmalıdır",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setReplyImageUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setReplyImageUrl(null);
  };

  const createReplyMutation = useMutation({
    mutationFn: async (data: { content: string; imageUrl?: string; quotedReplyId?: string }) => {
      return await apiRequest("POST", `/api/forum-posts/${id}/replies`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts", id, "replies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      toast({
        title: "Başarılı",
        description: "Cevabınız eklendi",
      });
      setReplyContent("");
      setReplyImageUrl(null);
      setQuotedReplyId(null);
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

  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId: string) => {
      return await apiRequest("DELETE", `/api/forum-replies/${replyId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts", id, "replies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      toast({
        title: "Başarılı",
        description: "Cevap silindi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Cevap silinemedi",
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
    createReplyMutation.mutate({
      content: replyContent,
      imageUrl: replyImageUrl || undefined,
      quotedReplyId: quotedReplyId || undefined,
    });
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
        <Footer />
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
        <Footer />
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
                <span data-testid="text-post-author">{post.user.username}</span>
                
                {/* Yönetim etiketi (en öncelikli) */}
                {post.user.isSuperAdmin && (
                  <Badge 
                    variant="outline" 
                    className="bg-red-500/20 text-red-300 border-red-500/30 text-xs font-bold"
                  >
                    YÖNETİM
                  </Badge>
                )}
                
                {/* Admin/Staff rolü */}
                {post.staffRole && (
                  <Badge 
                    variant="outline" 
                    className={`${roleColors[post.staffRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                  >
                    {post.staffRole}
                  </Badge>
                )}
                
                {/* Oyuncu rolü */}
                {post.user.playerRole && (
                  <Badge 
                    variant="outline" 
                    className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs"
                  >
                    {post.user.playerRole}
                  </Badge>
                )}
                
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground" data-testid="text-post-content">
                {post.content}
              </p>
              {post.imageUrl && (
                <div className="mt-4">
                  <img 
                    src={post.imageUrl} 
                    alt="Post image" 
                    className="max-w-full h-auto rounded-md"
                    data-testid="img-post-image"
                  />
                </div>
              )}
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
                {quotedReplyId && (
                  <div className="bg-muted p-3 rounded-md relative">
                    <div className="flex items-start gap-2">
                      <Quote className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Alıntı yapılıyor...
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setQuotedReplyId(null)}
                        data-testid="button-remove-quote"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <Textarea 
                  placeholder="Cevabınızı yazın..."
                  rows={4}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  data-testid="textarea-reply-content"
                />
                {replyImageUrl ? (
                  <div className="relative inline-block">
                    <img 
                      src={replyImageUrl} 
                      alt="Preview" 
                      className="max-w-full h-auto max-h-48 rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                      data-testid="button-remove-reply-image"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="reply-image-upload"
                      data-testid="input-reply-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('reply-image-upload')?.click()}
                      data-testid="button-upload-reply-image"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Görsel Ekle
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Maksimum 5MB
                    </p>
                  </div>
                )}
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
                      
                      {/* Yönetim etiketi (en öncelikli) */}
                      {reply.user.isSuperAdmin && (
                        <Badge 
                          variant="outline" 
                          className="bg-red-500/20 text-red-300 border-red-500/30 text-xs font-bold"
                        >
                          YÖNETİM
                        </Badge>
                      )}
                      
                      {/* Admin/Staff rolü */}
                      {reply.staffRole && (
                        <Badge 
                          variant="outline" 
                          className={`${roleColors[reply.staffRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                        >
                          {reply.staffRole}
                        </Badge>
                      )}
                      
                      {/* Oyuncu rolü */}
                      {reply.user.playerRole && (
                        <Badge 
                          variant="outline" 
                          className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs"
                        >
                          {reply.user.playerRole}
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
                    {reply.quotedReplyId && (
                      <div className="bg-muted/50 border-l-4 border-primary/30 pl-4 py-2 mb-3 rounded">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Quote className="w-3 h-3" />
                          Bir mesaja yanıt veriyor
                        </p>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-muted-foreground" data-testid={`text-reply-content-${reply.id}`}>
                      {reply.content}
                    </p>
                    {reply.imageUrl && (
                      <div className="mt-4">
                        <img 
                          src={reply.imageUrl} 
                          alt="Reply image" 
                          className="max-w-full h-auto rounded-md"
                          data-testid={`img-reply-image-${reply.id}`}
                        />
                      </div>
                    )}
                    {user && !post.isLocked && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setQuotedReplyId(reply.id);
                            document.querySelector<HTMLTextAreaElement>('[data-testid="textarea-reply-content"]')?.focus();
                          }}
                          data-testid={`button-quote-reply-${reply.id}`}
                        >
                          <Quote className="w-4 h-4 mr-2" />
                          Alıntıla
                        </Button>
                        {(reply.userId === user.id || user.isAdmin || user.isSuperAdmin) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReplyMutation.mutate(reply.id)}
                            disabled={deleteReplyMutation.isPending}
                            className="text-destructive"
                            data-testid={`button-delete-reply-${reply.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </Button>
                        )}
                      </div>
                    )}
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

      <Footer />
    </div>
  );
}
