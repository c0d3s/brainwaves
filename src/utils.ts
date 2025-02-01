import { BINAURAL_FREQ, BASE_FREQ } from "./constants";

export const calcFreq = (
  side: "left" | "right",
  base: keyof typeof BASE_FREQ,
  binaural: keyof typeof BINAURAL_FREQ,
  randomBeat: boolean = false,
) => {
  const baseFreq = BASE_FREQ[base];
  if (side === "left") return baseFreq;
  return (
    baseFreq +
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
