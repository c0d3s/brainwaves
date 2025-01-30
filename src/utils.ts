import { BINAURAL_FREQ, SOLFEGGIO_FREQ } from './constants';

export function calcFreq(
  side: 'left' | 'right',
  solfeggio: keyof typeof SOLFEGGIO_FREQ,
  binaural: keyof typeof BINAURAL_FREQ
) {
  const baseFreq = SOLFEGGIO_FREQ[solfeggio];
  const binauralFreq = BINAURAL_FREQ[binaural];
  
  return side === 'left' 
    ? baseFreq 
    : baseFreq + binauralFreq;
}

export function calcRandomBeat() {
  return Math.random() * 40; // Random beat between 0 and 40 Hz
} 