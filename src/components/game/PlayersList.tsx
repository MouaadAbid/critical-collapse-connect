import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlayersListProps {
  players: any[];
  currentUsername: string;
}

const PlayersList = ({ players, currentUsername }: PlayersListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Players ({players.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-2 rounded-lg ${
              player.username === currentUsername ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <div className="flex items-center gap-2">
              {player.is_host && <Crown className="h-4 w-4 text-accent" />}
              <span className="font-medium">{player.username}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Zone {player.current_zone}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlayersList;
