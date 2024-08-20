let audioContext: AudioContext | null = null;
const oscillators: Map<number, OscillatorNode> = new Map();

export const playNote = (frequency: number) => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillators.set(frequency, oscillator);
};

export const stopNote = (frequency: number) => {
  const oscillator = oscillators.get(frequency);
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillators.delete(frequency);
  }
};