'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { playNote, stopNote } from '../utils/audio';
import { keys } from '../utils/recording'; // Import keys from recording.ts

interface PianoProps {
  isRecording: boolean;
  playingNotes: string[]; // New prop for currently playing notes
}

const Piano: React.FC<PianoProps> = ({ isRecording, playingNotes }) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const handleNotePlay = useCallback((key: typeof keys[0]) => {
    playNote(key.frequency);
  }, []);

  const handleNoteStop = useCallback((key: typeof keys[0]) => {
    stopNote(key.frequency);
  }, []);

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

  const handleTouchStart = (key: typeof keys[0]) => (e: React.TouchEvent) => {
    e.preventDefault();
    if (!activeKeys.has(key.key)) {
      setActiveKeys(prev => new Set(prev).add(key.key));
      handleNotePlay(key);
    }
  };

  const handleTouchEnd = (key: typeof keys[0]) => (e: React.TouchEvent) => {
    e.preventDefault();
    setActiveKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(key.key);
      return newSet;
    });
    handleNoteStop(key);
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-center min-w-max">
        {keys.map((key) => (
          <div
            key={key.key}
            data-note={key.note}
            className={`w-12 sm:w-14 md:w-12 h-32 sm:h-40 md:h-48 flex-grow border border-black flex flex-col items-center justify-end p-2 ${
              activeKeys.has(key.key)
                ? 'bg-blue-300'
                : playingNotes.includes(key.key)
                ? 'bg-green-300'
                : 'bg-white'
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
            onTouchStart={handleTouchStart(key)}
            onTouchEnd={handleTouchEnd(key)}
          >
            <span className="text-lg font-bold">{key.note}</span>
            <span className="text-sm">({key.key})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Piano;