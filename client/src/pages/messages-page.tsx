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
import { Send, MessageSquare } from "lucide-react";
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

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; message: string }) => {
      return await apiRequest("POST", "/api/private-messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/private-messages/${selectedUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/private-messages/conversations"] });
      setMessageText("");
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
    if (!messageText.trim() || !selectedUserId) return;
    sendMessageMutation.mutate({ receiverId: selectedUserId, message: messageText });
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
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
                <h2 className="text-xl font-semibold">Konuşmalar</h2>
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
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
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

                    <div className="flex gap-2">
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
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending || !messageText.trim()}
                        size="icon"
                        data-testid="button-send-message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
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
