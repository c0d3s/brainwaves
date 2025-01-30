import { useRef } from 'react';
import * as Tone from 'tone';

export function useSynths() {
  const synthLeft = useRef(new Tone.Oscillator({
    type: "sine",
    volume: -20,
  }).connect(new Tone.Panner(-1).toDestination()));

  const synthRight = useRef(new Tone.Oscillator({
    type: "sine",
    volume: -20,
  }).connect(new Tone.Panner(1).toDestination()));

  const synthNoise = useRef(new Tone.Noise({
    type: 'white',
    volume: -40,
  }).connect(new Tone.Panner(0).toDestination()));

  const harmonic = useRef(new Tone.Oscillator({
    type: "sine",
    volume: -20,
  }).connect(new Tone.Panner(0).toDestination()));

  const harmonicLFO = useRef(new Tone.LFO({
    type: "sine",
    frequency: 0.1,
    min: -20,
    max: 20
  }).connect(harmonic.current.frequency));

  const updateFrequency = (osc: Tone.Oscillator, newFreq: number) => {
    osc.frequency.exponentialRampTo(newFreq, 0.1);
  };

  return {
    synthLeft,
    synthRight,
    synthNoise,
    harmonic,
    harmonicLFO,
    updateFrequency
  };
} 