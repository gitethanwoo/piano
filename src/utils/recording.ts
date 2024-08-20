import { playNote, stopNote } from './audio';
import { supabase } from './supabase';

let isRecording = false;
let currentRecording: { note: string; startTime: number; endTime?: number }[] = [];
let startTime: number;

export const startRecording = () => {
  isRecording = true;
  currentRecording = [];
  startTime = Date.now();
};

export const stopRecording = () => {
  isRecording = false;
  const recording = {
    id: `recording-${Date.now()}`,
    notes: currentRecording,
  };
  currentRecording = [];
  return recording;
};

export const recordNote = (note: string, timestamp: number, isKeyDown: boolean) => {
  if (isRecording) {
    if (isKeyDown) {
      currentRecording.push({ note, startTime: timestamp - startTime });
    } else {
      const noteIndex = currentRecording.findIndex(
        (n) => n.note === note && n.endTime === undefined
      );
      if (noteIndex !== -1) {
        currentRecording[noteIndex].endTime = timestamp - startTime;
      }
    }
  }
};

export const playRecording = (notes: { note: string; startTime: number; endTime?: number }[] | string) => {
  const startPlayTime = Date.now();
  let parsedNotes: { note: string; startTime: number; endTime?: number }[];

  try {
    if (typeof notes === 'string') {
      parsedNotes = JSON.parse(notes);
    } else if (Array.isArray(notes)) {
      parsedNotes = notes;
    } else {
      throw new Error('Invalid notes format');
    }

    if (!Array.isArray(parsedNotes)) {
      throw new Error('Parsed notes is not an array');
    }

    parsedNotes.forEach(({ note, startTime, endTime }) => {
      setTimeout(() => {
        const key = keys.find(k => k.note === note);
        if (key) {
          playNote(key.frequency);
          if (endTime) {
            const duration = endTime - startTime;
            setTimeout(() => stopNote(key.frequency), duration);
          } else {
            setTimeout(() => stopNote(key.frequency), 200); // Fallback to 200ms if no endTime
          }
        }
      }, startTime);
    });
  } catch (error) {
    console.error('Error playing recording:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
};

export const saveRecordingToSupabase = async (recording: { id: string; notes: { note: string; timestamp: number }[] }) => {
  try {
    console.log('Attempting to save recording to Supabase:', recording);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key (first 5 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 5));

    const { data, error } = await supabase
      .from('recordings')
      .insert([{ id: recording.id, notes: JSON.stringify(recording.notes) }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Recording saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving recording:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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
      notes: typeof record.notes === 'string' ? JSON.parse(record.notes) : record.notes,
    }));
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return [];
  }
};

const keys = [
  { note: 'C', key: 'A', frequency: 261.63 },
  { note: 'D', key: 'S', frequency: 293.66 },
  { note: 'E', key: 'D', frequency: 329.63 },
  { note: 'F', key: 'F', frequency: 349.23 },
  { note: 'G', key: 'G', frequency: 392.00 },
  { note: 'A', key: 'H', frequency: 440.00 },
  { note: 'B', key: 'J', frequency: 493.88 },
  { note: 'C', key: 'K', frequency: 523.25 },
];