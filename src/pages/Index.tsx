import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Activity, Users, Brain, MessageSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Activity className="w-20 h-20 text-critical animate-heartbeat" />
              <div className="absolute inset-0 animate-pulse-glow rounded-full" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Collapsing Hospital
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A multiplayer medical emergency simulation. Collaborate with your team across 4 hospital zones, 
            answer medical quizzes, and save lives before time runs out.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate('/lobby')}
            >
              Start Game
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
            >
              How to Play
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multiplayer</h3>
            <p className="text-sm text-muted-foreground">
              Team up with up to 4 players on your local network
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Medical Quizzes</h3>
            <p className="text-sm text-muted-foreground">
              Answer questions correctly to stabilize patients
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-critical/10 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-critical" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Heart Rate Monitor</h3>
            <p className="text-sm text-muted-foreground">
              Watch the vitals decline - work fast to save lives
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Team Chat</h3>
            <p className="text-sm text-muted-foreground">
              Coordinate with teammates in real-time
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">4</div>
            <div className="text-muted-foreground">Hospital Zones</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">100+</div>
            <div className="text-muted-foreground">Medical Questions</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-critical mb-2">Real-Time</div>
            <div className="text-muted-foreground">Multiplayer Action</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
