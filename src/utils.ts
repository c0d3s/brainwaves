import { BINAURAL_FREQ, solfeggio_FREQ } from './constants';

export function calcFreq(
  side: 'left' | 'right',
  solfeggio: keyof typeof solfeggio_FREQ,
  binaural: keyof typeof BINAURAL_FREQ
) {
  const baseFreq = solfeggio_FREQ[solfeggio];
  const binauralFreq = BINAURAL_FREQ[binaural];
  
  return side === 'left' 
    ? baseFreq 
    : baseFreq + binauralFreq;
}

export function calcRandomBeat() {
  return Math.random() * 40; // Random beat between 0 and 40 Hz
} 