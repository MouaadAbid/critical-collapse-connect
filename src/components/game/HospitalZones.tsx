import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Syringe, Heart, BrainCircuit } from "lucide-react";

interface HospitalZonesProps {
  currentZone: number;
  onZoneClick: (zone: number) => void;
}

const zones = [
  {
    id: 1,
    name: "Emergency Room",
    icon: Stethoscope,
    color: "text-critical",
    bgColor: "bg-critical/10",
    description: "Triage and immediate care",
  },
  {
    id: 2,
    name: "Surgery Ward",
    icon: Syringe,
    color: "text-accent",
    bgColor: "bg-accent/10",
    description: "Surgical procedures",
  },
  {
    id: 3,
    name: "Cardiology",
    icon: Heart,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Heart treatments",
  },
  {
    id: 4,
    name: "Neurology",
    icon: BrainCircuit,
    color: "text-success",
    bgColor: "bg-success/10",
    description: "Brain and nervous system",
  },
];

const HospitalZones = ({ currentZone, onZoneClick }: HospitalZonesProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {zones.map((zone) => {
        const Icon = zone.icon;
        const isCurrentZone = zone.id === currentZone;

        return (
          <Card
            key={zone.id}
            className={`p-6 transition-all cursor-pointer hover:shadow-lg ${
              isCurrentZone ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onZoneClick(zone.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-16 h-16 ${zone.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-8 h-8 ${zone.color}`} />
              </div>
              {isCurrentZone && (
                <div className="text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded">
                  Current
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">{zone.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{zone.description}</p>
            <Button
              className="w-full"
              variant={isCurrentZone ? "default" : "outline"}
            >
              Enter Zone
            </Button>
          </Card>
        );
      })}
    </div>
  );
};

export default HospitalZones;
