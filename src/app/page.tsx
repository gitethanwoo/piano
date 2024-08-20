'use client'

import { useState } from 'react';
import Piano from '../components/Piano';
import RecordingControls from '../components/RecordingControls';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Virtual Piano</h1>
      <Piano isRecording={isRecording} />
      <RecordingControls
        isRecording={isRecording}
        onStartRecording={() => setIsRecording(true)}
        onStopRecording={() => setIsRecording(false)}
      />
    </main>
  );
}