import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface GameHeaderProps {
  room: any;
  isHost: boolean;
  onStartGame: () => void;
}

const GameHeader = ({ room, isHost, onStartGame }: GameHeaderProps) => {
  const navigate = useNavigate();

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    toast.success("Room code copied!");
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/lobby")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Room Code:</span>
              <code className="bg-muted px-2 py-1 rounded font-mono font-bold">
                {room.code}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyRoomCode}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-4">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-bold capitalize">{room.status}</div>
          </div>
          {isHost && room.status === "waiting" && (
            <Button onClick={onStartGame}>
              <Play className="h-4 w-4 mr-2" />
              Start Game
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GameHeader;
