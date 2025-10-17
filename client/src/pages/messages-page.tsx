import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, UserPlus, Search, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

type User = {
  id: string;
  username: string;
  playerRole?: string;
};

type PrivateMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  imageUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
};

type Conversation = {
  otherUser: User;
  lastMessage: PrivateMessage;
  unreadCount: number;
};

export default function MessagesPage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageImageUrl, setMessageImageUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/private-messages/conversations"],
    enabled: !!user,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<PrivateMessage[]>({
    queryKey: [`/api/private-messages/${selectedUserId}`],
    enabled: !!selectedUserId && !!user,
    refetchOnMount: true,
    staleTime: 0,
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery<User[]>({
    queryKey: [`/api/users/search?query=${searchQuery}`],
    enabled: !!searchQuery && searchQuery.length >= 2,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; message: string; imageUrl?: string | null }) => {
      return await apiRequest("POST", "/api/private-messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/private-messages/${selectedUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/private-messages/conversations"] });
      setMessageText("");
      setMessageImageUrl(null);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await apiRequest("PATCH", `/api/private-messages/${messageId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/private-messages/${selectedUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/private-messages/conversations"] });
    },
  });

  const handleSendMessage = () => {
    if ((!messageText.trim() && !messageImageUrl) || !selectedUserId) return;
    sendMessageMutation.mutate({ 
      receiverId: selectedUserId, 
      message: messageText,
      imageUrl: messageImageUrl 
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Dosya Boyutu Hatası",
        description: "Görsel boyutu 5MB'den küçük olmalıdır",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMessageImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setMessageImageUrl(null);
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsDialogOpen(false);
    setSearchQuery("");
  };

  // Mark unread messages as read when switching conversations  
  useEffect(() => {
    if (messages.length > 0 && selectedUserId && user) {
      const unreadMessages = messages.filter(
        (m) => m.senderId === selectedUserId && m.receiverId === user.id && !m.isRead
      );
      
      if (unreadMessages.length > 0) {
        // Mark all unread messages (note: this may send multiple requests)
        unreadMessages.forEach((m) => markAsReadMutation.mutate(m.id));
      }
    }
  }, [selectedUserId]);

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={null} onLogout={logout} />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Mesajları görmek için giriş yapmanız gerekmektedir.</p>
            <Button className="mt-4" onClick={() => navigate("/login")} data-testid="button-login">
              Giriş Yap
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedConversation = conversations.find((c) => c.otherUser.id === selectedUserId);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-heading font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            Özel Mesajlar
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversations List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold">Konuşmalar</h2>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" data-testid="button-new-message">
                        <UserPlus className="w-4 h-4 mr-1" />
                        Yeni Mesaj
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Yeni Mesaj Gönder</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Kullanıcı adı ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            data-testid="input-search-user"
                          />
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {searchLoading ? (
                            <p className="text-center text-muted-foreground">Aranıyor...</p>
                          ) : searchQuery.length < 2 ? (
                            <p className="text-center text-muted-foreground">En az 2 karakter girin</p>
                          ) : searchResults.length === 0 ? (
                            <p className="text-center text-muted-foreground">Kullanıcı bulunamadı</p>
                          ) : (
                            searchResults
                              .filter((u) => u.id !== user?.id)
                              .map((searchUser) => (
                                <div
                                  key={searchUser.id}
                                  className="p-3 rounded-md cursor-pointer hover-elevate active-elevate-2"
                                  onClick={() => handleSelectUser(searchUser.id)}
                                  data-testid={`user-result-${searchUser.id}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback>{searchUser.username[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{searchUser.username}</p>
                                      {searchUser.playerRole && (
                                        <Badge variant="outline" className="text-xs">
                                          {searchUser.playerRole}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <p className="text-muted-foreground text-center">Yükleniyor...</p>
                ) : conversations.length === 0 ? (
                  <p className="text-muted-foreground text-center">Henüz mesaj yok</p>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.otherUser.id}
                        className={`p-3 rounded-md cursor-pointer hover-elevate active-elevate-2 ${
                          selectedUserId === conv.otherUser.id ? "bg-accent" : ""
                        }`}
                        onClick={() => handleSelectConversation(conv.otherUser.id)}
                        data-testid={`conversation-${conv.otherUser.id}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{conv.otherUser.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{conv.otherUser.username}</p>
                            {conv.otherUser.playerRole && (
                              <Badge variant="outline" className="text-xs">
                                {conv.otherUser.playerRole}
                              </Badge>
                            )}
                          </div>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="bg-primary">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message Thread */}
            <Card className="md:col-span-2">
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  {selectedConversation ? selectedConversation.otherUser.username : "Mesajlar"}
                </h2>
              </CardHeader>
              <CardContent>
                {!selectedUserId ? (
                  <p className="text-muted-foreground text-center">
                    Mesajları görmek için bir konuşma seçin
                  </p>
                ) : messagesLoading ? (
                  <p className="text-muted-foreground text-center">Yükleniyor...</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                          data-testid={`message-${msg.id}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-md ${
                              msg.senderId === user.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {msg.message && (
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            )}
                            {msg.imageUrl && (
                              <img 
                                src={msg.imageUrl} 
                                alt="Message attachment" 
                                className="max-w-full h-auto rounded-md mt-2"
                                data-testid={`img-message-${msg.id}`}
                              />
                            )}
                            <p className="text-xs mt-1 opacity-70">
                              {formatDistanceToNow(new Date(msg.createdAt), {
                                addSuffix: true,
                                locale: tr,
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {messageImageUrl && (
                        <div className="relative inline-block">
                          <img 
                            src={messageImageUrl} 
                            alt="Preview" 
                            className="max-w-full h-auto max-h-48 rounded-md"
                            data-testid="img-message-preview"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                            data-testid="button-remove-message-image"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <Textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Mesajınızı yazın..."
                            rows={3}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            data-testid="textarea-message"
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="message-image-upload"
                              data-testid="input-message-image"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('message-image-upload')?.click()}
                              data-testid="button-upload-message-image"
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Görsel Ekle
                            </Button>
                          </div>
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          disabled={sendMessageMutation.isPending || (!messageText.trim() && !messageImageUrl)}
                          size="icon"
                          data-testid="button-send-message"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
