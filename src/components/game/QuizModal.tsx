import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Lightbulb } from "lucide-react";

interface QuizModalProps {
  zone: number;
  roomId: string;
  playerId: string;
  onClose: () => void;
}

const QuizModal = ({ zone, roomId, playerId, onClose }: QuizModalProps) => {
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, [zone]);

  const loadQuestion = async () => {
    const { data } = await supabase
      .from("medical_questions")
      .select("*")
      .eq("zone", zone)
      .limit(1);

    if (data && data.length > 0) {
      const q = data[Math.floor(Math.random() * data.length)];
      setQuestion(q);
      
      // Shuffle answers
      const allAnswers = [q.correct_answer, ...q.wrong_answers];
      const shuffled = allAnswers.sort(() => Math.random() - 0.5);
      setAnswers(shuffled);
    }
  };

  const handleAnswer = async (selectedAnswer: string) => {
    if (answered) return;
    
    setAnswered(true);
    const isCorrect = selectedAnswer === question.correct_answer;

    // Record the attempt
    await supabase.from("game_events").insert({
      room_id: roomId,
      player_id: playerId,
      event_type: "quiz_attempt",
      event_data: {
        zone,
        question_id: question.id,
        correct: isCorrect,
      },
    });

    if (isCorrect) {
      // Increase heart rate on correct answer
      const { data: room } = await supabase
        .from("game_rooms")
        .select("current_heart_rate")
        .eq("id", roomId)
        .single();

      if (room) {
        const newRate = Math.min(100, room.current_heart_rate + 10);
        await supabase
          .from("game_rooms")
          .update({ current_heart_rate: newRate })
          .eq("id", roomId);
      }

      toast.success("Correct! Patient stabilizing...");
      setTimeout(onClose, 1500);
    } else {
      toast.error("Incorrect! Try again.");
      setTimeout(() => {
        setAnswered(false);
      }, 1500);
    }
  };

  if (!question) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">Loading question...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-primary" />
            Medical Quiz - Zone {zone}
          </DialogTitle>
          <DialogDescription>
            Answer correctly to stabilize the patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-lg font-medium">{question.question}</p>
          </div>

          {question.hint && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(!showHint)}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {showHint ? "Hide" : "Show"} Hint
              </Button>
            </div>
          )}

          {showHint && question.hint && (
            <div className="bg-accent/10 border border-accent p-3 rounded-lg">
              <p className="text-sm text-accent-foreground">
                💡 <strong>Hint:</strong> {question.hint}
              </p>
            </div>
          )}

          <div className="grid gap-3">
            {answers.map((answer, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto py-4 text-left justify-start ${
                  answered && answer === question.correct_answer
                    ? "bg-success/20 border-success"
                    : answered && answer !== question.correct_answer
                    ? "bg-destructive/20 border-destructive"
                    : ""
                }`}
                onClick={() => handleAnswer(answer)}
                disabled={answered}
              >
                <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                {answer}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;
