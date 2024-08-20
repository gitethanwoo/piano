import { playNote, stopNote } from './audio';
import { supabase } from './supabase';
import { getLocationData } from './location';

let isRecording = false;
let currentRecording: { timestamp: number; activeNotes: string[] }[] = [];
let startTime: number;

const RECORDING_INTERVAL = 50; // ms
let recordingInterval: NodeJS.Timeout | null = null;

let isPlaying = false; // Add this flag
let playbackTimeouts: NodeJS.Timeout[] = []; // Array to store timeouts

export const startRecording = () => {
  isRecording = true;
  currentRecording = [];
  startTime = Date.now();
  recordingInterval = setInterval(recordCurrentState, RECORDING_INTERVAL);
};

export const stopRecording = () => {
  isRecording = false;
  if (recordingInterval) {
    clearInterval(recordingInterval);
  }
  const recording = {
    id: `recording-${Date.now()}`,
    frames: currentRecording,
  };
  currentRecording = [];
  return recording;
};

const recordCurrentState = () => {
  if (isRecording) {
    const timestamp = Date.now() - startTime;
    const activeNotes = Array.from(document.querySelectorAll('.bg-blue-300')).map(
      (el) => (el as HTMLElement).dataset.note || ''
    );
    const activeKeys = activeNotes.map(note => {
      const key = keys.find(k => k.note === note);
      return key ? key.key : '';
    }).filter(Boolean);
    currentRecording.push({ timestamp, activeNotes: activeKeys });
  }
};

export const keys = [
  { note: 'C', key: 'A', frequency: 261.63 },
  { note: 'D', key: 'S', frequency: 293.66 },
  { note: 'E', key: 'D', frequency: 329.63 },
  { note: 'F', key: 'F', frequency: 349.23 },
  { note: 'G', key: 'G', frequency: 392.00 },
  { note: 'A', key: 'H', frequency: 440.00 },
  { note: 'B', key: 'J', frequency: 493.88 },
  { note: 'C', key: 'K', frequency: 523.25 },
];

export const playRecording = (
  frames: { timestamp: number; activeNotes: string[] }[],
  onNotesChange: (notes: string[]) => void
) => {
  if (isPlaying) return; // Prevent multiple invocations
  isPlaying = true; // Set the flag to true

  let previousNotes: string[] = [];
  
  frames.forEach((frame, index) => {
    const timeout = setTimeout(() => {
      // Stop notes that are no longer active
      previousNotes.forEach(note => {
        if (!frame.activeNotes.includes(note)) {
          const key = keys.find(k => k.key === note); // Change from k.note to k.key
          if (key) stopNote(key.frequency);
        }
      });
      
      // Play new active notes
      frame.activeNotes.forEach(note => {
        if (!previousNotes.includes(note)) {
          const key = keys.find(k => k.key === note); // Change from k.note to k.key
          if (key) playNote(key.frequency);
        }
      });
      
      previousNotes = frame.activeNotes;
      onNotesChange(frame.activeNotes); // Call the callback with current active notes
    }, frame.timestamp);
    playbackTimeouts.push(timeout); // Store the timeout
  });

  return new Promise<void>((resolve) => {
    const finalTimeout = setTimeout(() => {
      onNotesChange([]); // Clear playing notes at the end
      isPlaying = false; // Reset the flag
      playbackTimeouts.forEach(clearTimeout); // Clear all timeouts
      playbackTimeouts = []; // Reset the timeouts array
      resolve();
    }, frames[frames.length - 1].timestamp);
    playbackTimeouts.push(finalTimeout); // Store the final timeout
  });
};

export const saveRecordingToSupabase = async (recording: { id: string; frames: { timestamp: number; activeNotes: string[] }[] }) => {
  try {
    const locationData = await getLocationData();
    const location = locationData ? `${locationData.city}, ${locationData.region}` : 'Unknown';
    const timestamp = new Date().toISOString();
    const name = `Recording ${new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })}`;

    const duration = recording.frames[recording.frames.length - 1].timestamp / 1000;

    const { data, error } = await supabase
      .from('recordings')
      .insert([{ 
        id: recording.id, 
        frames: JSON.stringify(recording.frames),
        location,
        timestamp,
        name,
        duration
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Recording saved successfully:', data);
    return {
      ...data,
      frames: JSON.parse(data.frames),
      duration: parseFloat(data.duration)
    };
  } catch (error) {
    console.error('Error saving recording:', error);
    return null;
  }
};

export const fetchRecordingsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(record => ({
      ...record,
      frames: JSON.parse(record.frames),
      duration: parseFloat(record.duration)
    }));
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return [];
  }
};