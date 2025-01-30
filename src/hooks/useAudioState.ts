import { useState, useEffect } from "react";
import * as Tone from "tone";
import { calcFreq, calcRandomBeat } from "../utils";
import { BINAURAL_FREQ, SOLFEGGIO_FREQ } from "../constants";

interface SynthRefs {
  synthLeft: React.RefObject<Tone.Oscillator>;
  synthRight: React.RefObject<Tone.Oscillator>;
  synthNoise: React.RefObject<Tone.Noise>;
  harmonic: React.RefObject<Tone.Oscillator>;
  harmonicLFO: React.RefObject<Tone.LFO>;
  updateFrequency: (osc: Tone.Oscillator, freq: number) => void;
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
  const [leftOptions, setLeftOptions] = useState({ frequency: 0, pan: -1 });
  const [rightOptions, setRightOptions] = useState({ frequency: 0, pan: 1 });
  const [harmonicOptions, setHarmonicOptions] = useState({
    frequency: 0,
    pan: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const updateSynthFrequency = (
    synth: Tone.Synth,
    options: { frequency: number },
  ) => {
    console.log("updateSynthFrequency", synth, options.frequency);
    synth.frequency.linearRampTo(options.frequency, 1);
  };

  const updateHarmonicFrequency = () => {
    const harmonicFreq = leftOptions.frequency * 1.5;
    setHarmonicOptions({ frequency: harmonicFreq, pan: 0 });
    harmonic.current?.frequency.linearRampTo(harmonicFreq, 1);
  };

  const updateLeftFrequency = () => {
    const leftFreq = calcFreq("left", solfeggio, binaural);
    setLeftOptions({ frequency: leftFreq, pan: -1 });
    updateFrequency(synthLeft.current!, leftFreq);
  };

  const updateRightFrequency = () => {
    const rightFreq = calcFreq("right", solfeggio, binaural);
    setRightOptions({ frequency: rightFreq, pan: 1 });
    setBeat(rightFreq - leftOptions.frequency);
    updateFrequency(synthRight.current!, rightFreq);
  };

  const updateNoise = () => {
    if (synthNoise.current) {
      // Stop the noise if it's playing
      if (isPlaying) {
        synthNoise.current.stop();
      }

      // Update the noise type
      synthNoise.current.type = noiseType === "off" ? "white" : noiseType;

      // Restart the noise if it was playing and not set to 'off'
      if (isPlaying && noiseType !== "off") {
        synthNoise.current.start();
      }
    }
  };

  const randomizeBeat = () => {
    const newBeat = calcRandomBeat(binaural);
    setBeat(newBeat);
    const rightFreq = leftOptions.frequency + newBeat;
    setRightOptions({ frequency: rightFreq, pan: 1 });
    updateFrequency(synthRight.current!, rightFreq);
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
    updateLeftFrequency();
  }, [solfeggio]);

  useEffect(() => {
    updateNoise();
  }, [noiseType]);

  useEffect(() => {
    updateHarmonicFrequency();
    updateRightFrequency();
  }, [leftOptions.frequency, binaural]);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  return {
    isPlaying,
    solfeggio,
    binaural,
    noiseType,
    beat,
    leftOptions,
    rightOptions,
    harmonicOptions,
    updateLeftFrequency,
    updateRightFrequency,
    updateNoise,
    playTone,
    randomizeBeat,
    setSolfeggio,
    setBinaural,
    setNoiseType,
    setLeftOptions,
    setRightOptions,
    updateSynthFrequency,
  };
}
