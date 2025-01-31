import { useState, useEffect, useCallback } from "react";
import * as Tone from "tone";
import { calcFreq, calcRandomBeat } from "../utils";
import { BINAURAL_FREQ, SOLFEGGIO_FREQ } from "../constants";

const DEFAULT_SOLFEGGIO: keyof typeof SOLFEGGIO_FREQ = "ut";
const DEFAULT_BINAURAL: keyof typeof BINAURAL_FREQ = "alpha";

interface SynthRefs {
  synthLeft: React.RefObject<Tone.Oscillator>;
  synthRight: React.RefObject<Tone.Oscillator>;
  synthNoise: React.RefObject<Tone.Noise>;
  harmonic: React.RefObject<Tone.Oscillator>;
  harmonicLFO: React.RefObject<Tone.LFO>;
  updateFrequency: (osc: Tone.Oscillator, freq: number) => void;
}

interface OscillatorOptions {
  left: {
    frequency: number;
    pan: number;
  };
  right: {
    frequency: number;
    pan: number;
  };
}

export function useAudioState({
  synthLeft,
  synthRight,
  synthNoise,
  harmonic,
  harmonicLFO,
  updateFrequency,
}: SynthRefs) {
  // State declarations
  const [isPlaying, setIsPlaying] = useState(false);
  const [solfeggio, setSolfeggio] = useState<keyof typeof SOLFEGGIO_FREQ>("ut");
  const [binaural, setBinaural] = useState<keyof typeof BINAURAL_FREQ>("alpha");
  const [noiseType, setNoiseType] = useState<
    "white" | "pink" | "brown" | "off"
  >("off");
  const [beat, setBeat] = useState(0);
  const [oscillatorOptions, setOscillatorOptions] = useState<OscillatorOptions>(
    {
      left: { frequency: SOLFEGGIO_FREQ[DEFAULT_SOLFEGGIO], pan: -1 },
      right: {
        frequency:
          SOLFEGGIO_FREQ[DEFAULT_SOLFEGGIO] +
          BINAURAL_FREQ[DEFAULT_BINAURAL].min,
        pan: 1,
      },
    },
  );
  const [harmonicOptions, setHarmonicOptions] = useState({
    frequency: 0,
    pan: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const updateSynthFrequency = (
    synth: Tone.Synth,
    options: { frequency: number },
  ) => {
    synth.frequency.linearRampTo(options.frequency, 1);
  };

  const updateHarmonicFrequency = () => {
    const harmonicFreq = oscillatorOptions.left.frequency * 1.5;
    setHarmonicOptions({ frequency: harmonicFreq, pan: 0 });
    harmonic.current?.frequency.linearRampTo(harmonicFreq, 1);
  };

  const updateSynthFrequencies = (leftFreq: number, rightFreq: number) => {
    setOscillatorOptions({
      left: { ...oscillatorOptions.left, frequency: leftFreq },
      right: { ...oscillatorOptions.right, frequency: rightFreq },
    });

    if (synthLeft.current) {
      updateFrequency(synthLeft.current, leftFreq);
    }
    if (synthRight.current) {
      updateFrequency(synthRight.current, rightFreq);
    }
  };

  const updateNoise = () => {
    if (!synthNoise.current) return;

    try {
      // Always stop first to prevent overlapping
      synthNoise.current.stop();

      // Update type
      synthNoise.current.type = noiseType === "off" ? "white" : noiseType;

      // Start if playing and not off
      if (isPlaying && noiseType !== "off") {
        synthNoise.current.start();
      }
    } catch (error) {
      console.error("Error updating noise:", error);
    }
  };

  const randomizeBeat = () => {
    const newBeat = calcRandomBeat(binaural);
    setBeat(newBeat);
    const rightFreq = oscillatorOptions.left.frequency + newBeat;
    updateSynthFrequencies(oscillatorOptions.left.frequency, rightFreq);
  };

  const playTone = async () => {
    if (!isPlaying) {
      synthLeft.current?.start();
      synthRight.current?.start();
      harmonic.current?.start();
      harmonicLFO.current?.start();
      if (noiseType !== "off") synthNoise.current?.start();
    } else {
      synthLeft.current?.stop();
      synthRight.current?.stop();
      harmonic.current?.stop();
      harmonicLFO.current?.stop();
      synthNoise.current?.stop();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    updateHarmonicFrequency();
  }, [oscillatorOptions.left.frequency]);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    updateNoise();
  }, [noiseType, isPlaying]);

  useEffect(() => {
    if (oscillatorOptions.left.frequency < oscillatorOptions.right.frequency) {
      setBeat(
        oscillatorOptions.right.frequency - oscillatorOptions.left.frequency,
      );
    }
  }, [oscillatorOptions.left.frequency, oscillatorOptions.right.frequency]);

  return {
    isPlaying,
    solfeggio,
    binaural,
    noiseType,
    beat,
    oscillatorOptions,
    harmonicOptions,
    updateSynthFrequencies,
    updateNoise,
    playTone,
    randomizeBeat,
    setSolfeggio,
    setBinaural,
    setNoiseType,
    updateSynthFrequency,
  };
}
