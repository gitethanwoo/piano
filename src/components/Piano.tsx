'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { playNote, stopNote } from '../utils/audio';
import { recordNote } from '../utils/recording';

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

interface PianoProps {
  isRecording: boolean;
  onNotePlay?: (note: string, timestamp: number) => void;
}

const Piano: React.FC<PianoProps> = ({ isRecording, onNotePlay }) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const handleNotePlay = useCallback((key: typeof keys[0]) => {
    playNote(key.frequency);
    if (isRecording) {
      recordNote(key.note, Date.now(), true);
    }
    if (onNotePlay) {
      onNotePlay(key.note, Date.now());
    }
  }, [isRecording, onNotePlay]);

  const handleNoteStop = useCallback((key: typeof keys[0]) => {
    stopNote(key.frequency);
    if (isRecording) {
      recordNote(key.note, Date.now(), false);
    }
  }, [isRecording]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = keys.find(k => k.key.toLowerCase() === e.key.toLowerCase());
    if (key && !activeKeys.has(key.key)) {
      setActiveKeys(prev => new Set(prev).add(key.key));
      handleNotePlay(key);
    }
  }, [activeKeys, handleNotePlay]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = keys.find(k => k.key.toLowerCase() === e.key.toLowerCase());
    if (key) {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key.key);
        return newSet;
      });
      handleNoteStop(key);
    }
  }, [handleNoteStop]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="flex">
      {keys.map((key) => (
        <div
          key={key.note + key.key}
          className={`w-16 h-48 border border-black flex flex-col items-center justify-end p-2 ${
            activeKeys.has(key.key) ? 'bg-blue-300' : 'bg-white'
          }`}
          onMouseDown={() => {
            if (!activeKeys.has(key.key)) {
              setActiveKeys(prev => new Set(prev).add(key.key));
              handleNotePlay(key);
            }
          }}
          onMouseUp={() => {
            setActiveKeys(prev => {
              const newSet = new Set(prev);
              newSet.delete(key.key);
              return newSet;
            });
            handleNoteStop(key);
          }}
          onMouseLeave={() => {
            if (activeKeys.has(key.key)) {
              setActiveKeys(prev => {
                const newSet = new Set(prev);
                newSet.delete(key.key);
                return newSet;
              });
              handleNoteStop(key);
            }
          }}
        >
          <span className="text-lg font-bold">{key.note}</span>
          <span className="text-sm">({key.key})</span>
        </div>
      ))}
    </div>
  );
};

export default Piano;