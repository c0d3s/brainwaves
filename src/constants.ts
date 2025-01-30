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

export const SOLFEGGIO_FREQ = {
  foundation: 174,
  healing: 285,
  ut: 396,
  re: 417,
  mi: 528,
  fa: 639,
  sol: 741,
  la: 852,
  universe: 963,
} as const;
