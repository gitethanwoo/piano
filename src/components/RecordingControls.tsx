'use client'

import React, { useState, useEffect } from 'react';
import { startRecording, stopRecording, playRecording, saveRecordingToSupabase, fetchRecordingsFromSupabase } from '../utils/recording';
import { Button } from './ui/button';

interface Recording {
  id: string;
  notes: { note: string; timestamp: number }[];
}

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
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
      const formattedRecording = {
        ...newRecording,
        notes: newRecording.notes.map(({ note, startTime }) => ({ note, timestamp: startTime }))
      };
      const savedRecording = await saveRecordingToSupabase(formattedRecording);
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
    if (recording && recording.notes) {
      const formattedNotes = recording.notes.map(note => ({
        ...note,
        startTime: note.timestamp,
        endTime: note.timestamp + 1000 // Assuming a default duration of 1 second
      }));
      playRecording(formattedNotes);
    } else {
      console.error('Invalid recording or notes');
    }
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
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Recordings</h2>
        <ul>
          {recordings.map((recording) => (
            <li key={recording.id} className="mb-2">
              <Button variant="outline" onClick={() => handlePlayRecording(recording)}>
                Play Recording {recording.id}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecordingControls;