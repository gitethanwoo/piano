'use client'

import React, { useState, useEffect } from 'react';
import { startRecording, stopRecording, saveRecordingToSupabase, fetchRecordingsFromSupabase } from '../utils/recording';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';

interface Recording {
  id: string;
  frames: { timestamp: number; activeNotes: string[] }[];
  location: string;
  timestamp: string;
  name: string;
  duration: number;
}

interface RecordingControlsProps {
  isRecording: boolean;
  isPlaying: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording: (frames: { timestamp: number; activeNotes: string[] }[]) => void;
  onNotesChange: (notes: string[]) => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isPlaying,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  onNotesChange,
}) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    fetchRecordingsFromSupabase().then(setRecordings);
  }, []);

  const handleStartRecording = () => {
    onStartRecording();
    startRecording();
  };

  const handleStopRecording = async () => {
    onStopRecording();
    const newRecording = stopRecording();
    if (newRecording) {
      const savedRecording = await saveRecordingToSupabase(newRecording);
      if (savedRecording) {
        console.log('Recording saved and returned from Supabase:', savedRecording);
        setRecordings(prev => [...prev, savedRecording]);
      } else {
        console.error('Failed to save recording to Supabase');
      }
    } else {
      console.log('No new recording to save');
    }
  };

  const handlePlayRecording = (recording: Recording) => {
    if (recording && Array.isArray(recording.frames) && !isPlaying) {
      onPlayRecording(recording.frames);
    } else {
      console.error('Invalid recording or frames, or already playing');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  return (
    <div className="mt-8">
      {isRecording ? (
        <Button variant="destructive" onClick={handleStopRecording}>
          Stop Recording
        </Button>
      ) : (
        <Button variant="default" onClick={handleStartRecording}>
          Start Recording
        </Button>
      )}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recordings.map((recording) => (
          <Card key={recording.id}>
            <CardHeader>
              <CardTitle className="text-sm">{recording.name}</CardTitle>
              <CardDescription>{recording.location} • {formatTimestamp(recording.timestamp)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Number of frames: {recording.frames.length}</p>
              <p>Duration: {recording.duration.toFixed(2)} seconds</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => handlePlayRecording(recording)}
                disabled={isPlaying}
              >
                {isPlaying ? 'Playing...' : 'Play Recording'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecordingControls;