export const BINAURAL_FREQ = {
  delta: {
    min: 0.5,
    max: 4,
  },
  theta: {
    min: 4,
    max: 8,
  },
  alpha: {
    min: 8,
    max: 13,
  },
  beta: {
    min: 13,
    max: 30,
  },
  gamma: {
    min: 25,
    max: 34.75,
  },
} as const;

export const BASE_FREQ = {
  foundation: 174,
  healing: 285,
  ut: 396,
  re: 417,
  mi: 528,
  fa: 639,
  sol: 741,
  la: 852,
  universe: 963,
  c: 261.63, // Middle C
  d: 293.66, // D
  e: 329.63, // E
  g: 392.0, // G
  a: 440.0, // A
  c2: 523.25, // C (octave up)
} as const;

export const BASE_FREQ_COLUMNS = {
  foundation: 1,
  healing: 1,
  universe: 1,
  c: 2,
  d: 2,
  e: 2,
  g: 2,
  a: 2,
  c2: 2,
};
