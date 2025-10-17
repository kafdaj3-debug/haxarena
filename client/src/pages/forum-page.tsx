import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Lock, MessageSquare, Calendar, Archive, Lock as LockIcon, Image as ImageIcon, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ForumPost, User } from "@shared/schema";
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

const categories = [
  { value: "Genel Sohbet", label: "Genel Sohbet" },
  { value: "Öneriler", label: "Öneriler" },
  { value: "Sözlük", label: "Sözlük" },
];

const postSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter olmalıdır"),
  content: z.string().min(10, "İçerik en az 10 karakter olmalıdır"),
  category: z.string().min(1, "Kategori seçiniz"),
  imageUrl: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

type PostWithUser = ForumPost & { user: User; replyCount: number; staffRole?: string | null };

export default function ForumPage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      imageUrl: "",
    },
  });

  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/forum-posts", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/forum-posts?category=${encodeURIComponent(selectedCategory)}`
        : "/api/forum-posts";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Konular yüklenemedi");
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
      setImagePreview(base64String);
      form.setValue("imageUrl", base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("imageUrl", "");
  };

  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      return await apiRequest("POST", "/api/forum-posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      toast({
        title: "Başarılı",
        description: "Konu başarıyla oluşturuldu",
      });
      setDialogOpen(false);
      setImagePreview(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Konu oluşturulamadı",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostFormData) => {
    createPostMutation.mutate(data);
  };

  const filterPostsByTab = (tab: string) => {
    if (tab === "all") {
      setSelectedCategory(undefined);
    } else if (tab === "suggestions") {
      setSelectedCategory("Öneriler");
    } else if (tab === "general") {
      setSelectedCategory("Genel Sohbet");
    } else if (tab === "dictionary") {
      setSelectedCategory("Sözlük");
    }
  };

  const filteredPosts = posts || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2" data-testid="text-page-title">
                Forum
              </h1>
              <p className="text-muted-foreground">
                Toplulukla etkileşime geçin, sorularınızı sorun ve deneyimlerinizi paylaşın
              </p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="hover-elevate active-elevate-2" 
                  data-testid="button-create-post"
                  disabled={!user}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Konu Aç
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Yeni Konu Oluştur</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Başlık</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Konu başlığını girin" 
                              {...field} 
                              data-testid="input-post-title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-post-category">
                                <SelectValue placeholder="Kategori seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>İçerik</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Konu içeriğini yazın..." 
                              rows={6}
                              {...field} 
                              data-testid="textarea-post-content"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div>
                        <FormLabel>Görsel (Opsiyonel)</FormLabel>
                        <div className="mt-2">
                          {imagePreview ? (
                            <div className="relative inline-block">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="max-w-full h-auto max-h-64 rounded-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={removeImage}
                                data-testid="button-remove-image"
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
                                className="max-w-xs"
                                data-testid="input-post-image"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => document.querySelector<HTMLInputElement>('[data-testid="input-post-image"]')?.click()}
                                data-testid="button-upload-image"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Maksimum 5MB boyutunda görsel yükleyebilirsiniz
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
                        data-testid="button-cancel-post"
                      >
                        İptal
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createPostMutation.isPending}
                        data-testid="button-submit-post"
                      >
                        {createPostMutation.isPending ? "Oluşturuluyor..." : "Konu Oluştur"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {!user && (
            <Alert className="mb-6">
              <Lock className="w-4 h-4" />
              <AlertDescription data-testid="text-login-required">
                Konu açmak ve yorum yapmak için giriş yapmanız gerekmektedir. Kayıtsız kullanıcılar sadece okuyabilir.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="all" className="space-y-6" onValueChange={filterPostsByTab}>
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all">Tümü</TabsTrigger>
              <TabsTrigger value="suggestions" data-testid="tab-suggestions">Öneriler</TabsTrigger>
              <TabsTrigger value="general" data-testid="tab-general">Genel Sohbet</TabsTrigger>
              <TabsTrigger value="dictionary" data-testid="tab-dictionary">Sözlük</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => navigate(`/forum/${post.id}`)}
                    data-testid={`card-post-${post.id}`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                        <h3 className="text-lg font-semibold mb-1 truncate" data-testid={`text-post-title-${post.id}`}>
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                          </span>
                          <span>•</span>
                          <span>{post.user.username}</span>
                          {post.staffRole && (
                            <Badge 
                              variant="outline" 
                              className={`${roleColors[post.staffRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                            >
                              {post.staffRole}
                            </Badge>
                          )}
                          {!post.staffRole && post.user.role && post.user.role !== "HaxArena Üye" && (
                            <Badge 
                              variant="outline" 
                              className={`${roleColors[post.user.role] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                            >
                              {post.user.role}
                            </Badge>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.replyCount} cevap
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-posts">
                    Bu kategoride henüz konu bulunmamaktadır.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="team-applications" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => navigate(`/forum/${post.id}`)}
                    data-testid={`card-post-${post.id}`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                        <h3 className="text-lg font-semibold mb-1 truncate" data-testid={`text-post-title-${post.id}`}>
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                          </span>
                          <span>•</span>
                          <span>{post.user.username}</span>
                          {post.staffRole && (
                            <Badge 
                              variant="outline" 
                              className={`${roleColors[post.staffRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                            >
                              {post.staffRole}
                            </Badge>
                          )}
                          {!post.staffRole && post.user.role && post.user.role !== "HaxArena Üye" && (
                            <Badge 
                              variant="outline" 
                              className={`${roleColors[post.user.role] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                            >
                              {post.user.role}
                            </Badge>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.replyCount} cevap
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-posts">
                    Bu kategoride henüz konu bulunmamaktadır.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => navigate(`/forum/${post.id}`)}
                    data-testid={`card-post-${post.id}`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                        <h3 className="text-lg font-semibold mb-1 truncate" data-testid={`text-post-title-${post.id}`}>
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                          </span>
                          <span>•</span>
                          <span>{post.user.username}</span>
                          {post.staffRole && (
                            <Badge 
                              variant="outline" 
                              className={`${roleColors[post.staffRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                            >
                              {post.staffRole}
                            </Badge>
                          )}
                          {!post.staffRole && post.user.role && post.user.role !== "HaxArena Üye" && (
                            <Badge 
                              variant="outline" 
                              className={`${roleColors[post.user.role] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                            >
                              {post.user.role}
                            </Badge>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.replyCount} cevap
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-posts">
                    Bu kategoride henüz konu bulunmamaktadır.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="general" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => navigate(`/forum/${post.id}`)}
                    data-testid={`card-post-${post.id}`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                        <h3 className="text-lg font-semibold mb-1 truncate" data-testid={`text-post-title-${post.id}`}>
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                          </span>
                          <span>•</span>
                          <span>{post.user.username}</span>
                          {post.staffRole && (
                            <Badge 
                              variant="outline" 
                              className={`${roleColors[post.staffRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                            >
                              {post.staffRole}
                            </Badge>
                          )}
                          {!post.staffRole && post.user.role && post.user.role !== "HaxArena Üye" && (
                            <Badge 
                              variant="outline" 
                              className={`${roleColors[post.user.role] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                            >
                              {post.user.role}
                            </Badge>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.replyCount} cevap
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-posts">
                    Bu kategoride henüz konu bulunmamaktadır.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="dictionary" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => navigate(`/forum/${post.id}`)}
                    data-testid={`card-post-${post.id}`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                        <h3 className="text-lg font-semibold mb-1 truncate" data-testid={`text-post-title-${post.id}`}>
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                          </span>
                          <span>•</span>
                          <span>{post.user.username}</span>
                          {post.staffRole && (
                            <Badge 
                              variant="outline" 
                              className={`${roleColors[post.staffRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                            >
                              {post.staffRole}
                            </Badge>
                          )}
                          {!post.staffRole && post.user.role && post.user.role !== "HaxArena Üye" && (
                            <Badge 
                              variant="outline" 
                              className={`${roleColors[post.user.role] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                            >
                              {post.user.role}
                            </Badge>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.replyCount} cevap
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-posts">
                    Bu kategoride henüz konu bulunmamaktadır.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
