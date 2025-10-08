import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface HeartRateMonitorProps {
  heartRate: number;
}

const HeartRateMonitor = ({ heartRate }: HeartRateMonitorProps) => {
  const getStatusColor = () => {
    if (heartRate > 70) return "text-success";
    if (heartRate > 40) return "text-accent";
    return "text-critical";
  };

  const getStatusText = () => {
    if (heartRate > 70) return "Stable";
    if (heartRate > 40) return "Critical";
    return "Emergency";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary border-2 border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Activity className={`w-12 h-12 ${getStatusColor()} animate-heartbeat`} />
            <div className="absolute inset-0 animate-pulse-glow rounded-full" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground font-medium">Patient Status</div>
            <div className={`text-3xl font-bold ${getStatusColor()}`}>
              {heartRate} BPM
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">Status</div>
          <div className={`text-2xl font-bold ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>
      </div>
      
      {/* Heart Rate Bar */}
      <div className="mt-4 bg-muted rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            heartRate > 70
              ? "bg-success"
              : heartRate > 40
              ? "bg-accent"
              : "bg-critical animate-pulse-glow"
          }`}
          style={{ width: `${heartRate}%` }}
        />
      </div>
    </Card>
  );
};

export default HeartRateMonitor;
