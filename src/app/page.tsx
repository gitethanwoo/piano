'use client'

import { useState } from 'react';
import Piano from '../components/Piano';
import RecordingControls from '../components/RecordingControls';
import { playRecording } from '../utils/recording';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingNotes, setPlayingNotes] = useState<string[]>([]);

  const handlePlayRecording = async (frames: { timestamp: number; activeNotes: string[] }[]) => {
    if (isPlaying) return; // Prevent multiple plays
    setIsPlaying(true);
    await playRecording(frames, setPlayingNotes);
    setIsPlaying(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">Virtual Piano</h1>
      <div className="w-full max-w-4xl mx-auto">
        <Piano isRecording={isRecording} playingNotes={playingNotes} />
      </div>
      <RecordingControls
        isRecording={isRecording}
        isPlaying={isPlaying}
        onStartRecording={() => setIsRecording(true)}
        onStopRecording={() => setIsRecording(false)}
        onPlayRecording={handlePlayRecording}
        onNotesChange={setPlayingNotes}
      />
    </main>
  );
}