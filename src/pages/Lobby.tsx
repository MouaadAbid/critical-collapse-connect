import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, ArrowLeft } from "lucide-react";

const Lobby = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = async () => {
    if (!username.trim()) {
      toast.error("Please enter your username");
      return;
    }

    setIsCreating(true);
    try {
      const code = generateRoomCode();
      
      // Create game room
      const { data: room, error: roomError } = await supabase
        .from("game_rooms")
        .insert({
          name: `${username}'s Game`,
          code,
          status: "waiting",
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add player as host
      const { error: playerError } = await supabase
        .from("players")
        .insert({
          room_id: room.id,
          username,
          is_host: true,
        });

      if (playerError) throw playerError;

      toast.success("Room created!");
      navigate(`/game/${room.id}`, { state: { username, isHost: true } });
    } catch (error: any) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!username.trim()) {
      toast.error("Please enter your username");
      return;
    }
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }

    try {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from("game_rooms")
        .select("*, players(count)")
        .eq("code", roomCode.toUpperCase())
        .single();

      if (roomError || !room) {
        toast.error("Room not found");
        return;
      }

      if (room.status !== "waiting") {
        toast.error("Game already in progress");
        return;
      }

      // Check if room is full
      const playerCount = room.players[0]?.count || 0;
      if (playerCount >= room.max_players) {
        toast.error("Room is full");
        return;
      }

      // Add player
      const { error: playerError } = await supabase
        .from("players")
        .insert({
          room_id: room.id,
          username,
          is_host: false,
        });

      if (playerError) throw playerError;

      toast.success("Joined room!");
      navigate(`/game/${room.id}`, { state: { username, isHost: false } });
    } catch (error: any) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Room */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Create Room
              </CardTitle>
              <CardDescription>
                Host a new game session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Username</label>
                <Input
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                />
              </div>
              <Button
                className="w-full"
                onClick={createRoom}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Join Room
              </CardTitle>
              <CardDescription>
                Enter a room code to join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Username</label>
                <Input
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Room Code</label>
                <Input
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <Button
                className="w-full"
                variant="secondary"
                onClick={joinRoom}
              >
                Join Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
