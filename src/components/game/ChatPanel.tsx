import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatPanelProps {
  roomId: string;
  playerId: string;
}

const ChatPanel = ({ roomId, playerId }: ChatPanelProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();

    return () => {
      supabase.channel('chat-messages').unsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select(`
        *,
        players (username)
      `)
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const setupRealtimeSubscription = () => {
    supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const { data: playerData } = await supabase
            .from("players")
            .select("username")
            .eq("id", payload.new.player_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...payload.new, players: playerData },
          ]);
        }
      )
      .subscribe();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("chat_messages").insert({
      room_id: roomId,
      player_id: playerId,
      message: newMessage.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
  };

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Team Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <span className="font-semibold text-primary">
                {msg.players?.username}:
              </span>{" "}
              <span className="text-foreground">{msg.message}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={200}
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
