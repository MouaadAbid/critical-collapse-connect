-- Create game rooms table
CREATE TABLE public.game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  max_players INTEGER DEFAULT 4,
  current_heart_rate INTEGER DEFAULT 100,
  status TEXT DEFAULT 'waiting', -- waiting, active, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  current_zone INTEGER DEFAULT 1, -- 1-4 zones
  is_host BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medical questions table
CREATE TABLE public.medical_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  hint TEXT,
  zone INTEGER NOT NULL, -- 1-4 for different hospital zones
  difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create game events table for tracking quiz attempts
CREATE TABLE public.game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- quiz_attempt, zone_change, chat_message
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public game - anyone can read/write)
CREATE POLICY "Anyone can view game rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create game rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update game rooms" ON public.game_rooms FOR UPDATE USING (true);

CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can create players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete players" ON public.players FOR DELETE USING (true);

CREATE POLICY "Anyone can view questions" ON public.medical_questions FOR SELECT USING (true);

CREATE POLICY "Anyone can view events" ON public.game_events FOR SELECT USING (true);
CREATE POLICY "Anyone can create events" ON public.game_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can create messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- Enable realtime for multiplayer features
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Insert sample medical questions
INSERT INTO public.medical_questions (question, correct_answer, wrong_answers, hint, zone, difficulty) VALUES
('What is the normal resting heart rate for adults?', '60-100 bpm', ARRAY['40-60 bpm', '100-120 bpm', '120-140 bpm'], 'Think about typical healthy adults', 1, 'easy'),
('What does CPR stand for?', 'Cardiopulmonary Resuscitation', ARRAY['Cardiac Pressure Response', 'Critical Patient Recovery', 'Circulatory Pump Restoration'], 'It involves the heart and lungs', 1, 'easy'),
('What is the normal body temperature in Celsius?', '37°C', ARRAY['35°C', '39°C', '40°C'], 'Close to 98.6°F', 2, 'easy'),
('Which organ filters blood in the body?', 'Kidneys', ARRAY['Liver', 'Lungs', 'Spleen'], 'There are two of them', 2, 'medium'),
('What is the largest artery in the human body?', 'Aorta', ARRAY['Pulmonary artery', 'Carotid artery', 'Femoral artery'], 'It connects directly to the heart', 3, 'medium'),
('What does MRI stand for?', 'Magnetic Resonance Imaging', ARRAY['Medical Radiology Imaging', 'Molecular Response Indicator', 'Metric Radiation Index'], 'Uses magnets not radiation', 3, 'medium'),
('What is the medical term for high blood pressure?', 'Hypertension', ARRAY['Hypotension', 'Tachycardia', 'Bradycardia'], 'Hyper means high', 4, 'medium'),
('How many chambers does the human heart have?', 'Four', ARRAY['Two', 'Three', 'Six'], 'Two on each side', 4, 'easy');

-- Function to update heart rate periodically
CREATE OR REPLACE FUNCTION update_heart_rate()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamps
CREATE TRIGGER update_game_room_timestamp
BEFORE UPDATE ON public.game_rooms
FOR EACH ROW
EXECUTE FUNCTION update_heart_rate();