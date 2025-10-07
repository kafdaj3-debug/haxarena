import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Trash2, Smile } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const roleColors: Record<string, string> = {
  "Founder": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Master Coordinator": "bg-red-500/20 text-red-300 border-red-500/30",
  "Coordinator Admin": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Head Overseer Admin": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Inspector Admin": "bg-green-500/20 text-green-300 border-green-500/30",
  "Game Admin": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Arena Admin": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

export default function LiveChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch } = useQuery<any[]>({
    queryKey: ["/api/chat/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg: string) => {
      return await apiRequest("POST", "/api/chat/messages", { message: msg });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      refetch();
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Mesaj gönderilemedi";
      const match = errorMessage.match(/Lütfen (\d+) saniye bekleyin/);
      if (match) {
        toast({
          title: "Çok hızlı!",
          description: errorMessage.split(': ')[1],
          variant: "destructive",
        });
      } else {
        toast({
          title: "Hata",
          description: "Mesaj gönderilemedi",
          variant: "destructive",
        });
      }
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/chat/messages/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Mesaj silinemedi",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(message + emoji.native);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Anlık Sohbet
          <Badge variant="secondary" className="ml-auto">{messages?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-80 overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-lg">
            {messages?.map((msg: any) => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{msg.user.username}</span>
                  
                  {msg.user.isSuperAdmin && (
                    <Badge 
                      variant="outline" 
                      className="bg-red-500/20 text-red-300 border-red-500/30 text-xs font-bold"
                    >
                      YÖNETİM
                    </Badge>
                  )}
                  
                  {msg.staffRole && (
                    <Badge 
                      variant="outline" 
                      className={`${roleColors[msg.staffRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'} text-xs`}
                    >
                      {msg.staffRole}
                    </Badge>
                  )}
                  
                  {msg.user.playerRole && (
                    <Badge 
                      variant="outline" 
                      className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs"
                    >
                      {msg.user.playerRole}
                    </Badge>
                  )}
                  
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: tr })}
                  </span>
                  
                  {(user?.isAdmin || user?.isSuperAdmin) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-auto"
                      onClick={() => deleteMessageMutation.mutate(msg.id)}
                      data-testid={`button-delete-message-${msg.id}`}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-foreground/90">{msg.message}</p>
              </div>
            ))}
            {(!messages || messages.length === 0) && (
              <p className="text-center text-muted-foreground text-sm py-8">
                Henüz mesaj yok. İlk mesajı sen yaz!
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {user ? (
            <div className="flex gap-2">
              <Input
                placeholder="Mesajınızı yazın..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sendMessageMutation.isPending}
                data-testid="input-chat-message"
              />
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    data-testid="button-emoji-picker"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="dark"
                    locale="tr"
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !message.trim()}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              Mesaj göndermek için giriş yapmalısınız
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
