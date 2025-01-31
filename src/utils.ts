import { BINAURAL_FREQ, SOLFEGGIO_FREQ } from "./constants";

export const calcFreq = (
  side: "left" | "right",
  solfeggio: keyof typeof SOLFEGGIO_FREQ,
  binaural: keyof typeof BINAURAL_FREQ,
  randomBeat: boolean = false,
) => {
  const solfeggioFreq = SOLFEGGIO_FREQ[solfeggio];
  if (side === "left") return solfeggioFreq;
  return (
    solfeggioFreq +
    (randomBeat ? calcRandomBeat(binaural) : calcCenterBeat(binaural))
  );
};

export const calcCenterBeat = (binaural: keyof typeof BINAURAL_FREQ) => {
  const binauralFreq = BINAURAL_FREQ[binaural];
  return (binauralFreq.min + binauralFreq.max) / 2;
};

export const calcRandomBeat = (binaural: keyof typeof BINAURAL_FREQ) => {
  const binauralFreq = BINAURAL_FREQ[binaural];
  const min = binauralFreq.min;
  const max = binauralFreq.max;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
