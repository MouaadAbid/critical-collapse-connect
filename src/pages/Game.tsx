import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HeartRateMonitor from "@/components/game/HeartRateMonitor";
import HospitalZones from "@/components/game/HospitalZones";
import PlayersList from "@/components/game/PlayersList";
import ChatPanel from "@/components/game/ChatPanel";
import QuizModal from "@/components/game/QuizModal";
import GameHeader from "@/components/game/GameHeader";

const Game = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { username, isHost } = location.state || {};
  
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  useEffect(() => {
    if (!roomId || !username) {
      navigate("/lobby");
      return;
    }

    loadGameData();
    setupRealtimeSubscriptions();

    return () => {
      supabase.channel('game-updates').unsubscribe();
    };
  }, [roomId]);

  const loadGameData = async () => {
    // Load room
    const { data: roomData } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("id", roomId)
      .single();
    
    if (roomData) setRoom(roomData);

    // Load players
    const { data: playersData } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId);
    
    if (playersData) {
      setPlayers(playersData);
      const player = playersData.find((p) => p.username === username);
      setCurrentPlayer(player);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('game-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadGameData();
        }
      )
      .subscribe();
  };

  const handleZoneClick = (zone: number) => {
    if (room?.status !== "active") {
      toast.error("Game not started yet");
      return;
    }
    setSelectedZone(zone);
    setShowQuiz(true);
  };

  const handleStartGame = async () => {
    if (!isHost) return;

    const { error } = await supabase
      .from("game_rooms")
      .update({ status: "active" })
      .eq("id", roomId);

    if (error) {
      toast.error("Failed to start game");
      return;
    }

    toast.success("Game started!");
    startHeartRateDecline();
  };

  const startHeartRateDecline = () => {
    // Decline heart rate every 5 seconds
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("game_rooms")
        .select("current_heart_rate, status")
        .eq("id", roomId)
        .single();

      if (!data || data.status !== "active") {
        clearInterval(interval);
        return;
      }

      const newRate = Math.max(0, data.current_heart_rate - 2);
      
      await supabase
        .from("game_rooms")
        .update({ 
          current_heart_rate: newRate,
          status: newRate === 0 ? "failed" : "active"
        })
        .eq("id", roomId);

      if (newRate === 0) {
        toast.error("Game Over - Patient lost!");
        clearInterval(interval);
      }
    }, 5000);
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto p-4 space-y-4">
        <GameHeader
          room={room}
          isHost={isHost}
          onStartGame={handleStartGame}
        />

        <div className="grid lg:grid-cols-4 gap-4">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-4">
            <HeartRateMonitor heartRate={room.current_heart_rate} />
            <HospitalZones
              currentZone={currentPlayer?.current_zone || 1}
              onZoneClick={handleZoneClick}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PlayersList players={players} currentUsername={username} />
            <ChatPanel roomId={roomId!} playerId={currentPlayer?.id} />
          </div>
        </div>
      </div>

      {showQuiz && selectedZone && (
        <QuizModal
          zone={selectedZone}
          roomId={roomId!}
          playerId={currentPlayer?.id}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  );
};

export default Game;
