import "./App.css";
import { IconButton } from "@mui/material";
import { SolfeggioControls } from "./components/SolfeggioControls";
import { BinauralControls } from "./components/BinauralControls";
import { NoiseControls } from "./components/NoiseControls";
import { PlayControls } from "./components/PlayControls";
import { useSynths } from "./hooks/useSynths";
import { useAudioState } from "./hooks/useAudioState";
import brainwavesLogo from "./assets/brainwaves.svg";
import { SOLFEGGIO_FREQ, BINAURAL_FREQ } from "./constants";
import { FrequencyCanvas } from "./components/FrequencyCanvas";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
import * as Tone from "tone";

declare global {
  interface Window {
    synthLeft: Tone.Synth;
    synthRight: Tone.Synth;
    synthNoise: Tone.Noise;
    harmonic: Tone.PolySynth;
    harmonicLFO: Tone.LFO;
  }
}

function App() {
  const {
    synthLeft,
    synthRight,
    synthNoise,
    harmonic,
    harmonicLFO,
    updateFrequency,
  } = useSynths();

  const audioState = useAudioState({
    synthLeft,
    synthRight,
    synthNoise,
    harmonic,
    harmonicLFO,
    updateFrequency,
  });

  const handleFrequencyChange = (leftFreq: number, rightFreq: number) => {
    if (!synthLeft.current || !synthRight.current) return;
    audioState.updateSynthFrequencies(leftFreq, rightFreq);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <IconButton
          href="https://simple.wikipedia.org/wiki/Binaural_beats"
          target="_blank"
          color="primary"
        >
          <img src={brainwavesLogo} className="logo" alt="Brainwaves logo" />
        </IconButton>
      </div>
      <div className="card">
        <PlayControls
          isPlaying={audioState.isPlaying}
          beat={audioState.beat}
          onPlay={audioState.playTone}
          onRandomize={audioState.randomizeBeat}
        />
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
          <SolfeggioControls
            solfeggio={audioState.solfeggio}
            setSolfeggio={audioState.setSolfeggio}
          />
          <BinauralControls
            binaural={audioState.binaural}
            setBinaural={audioState.setBinaural}
          />
          <NoiseControls
            noiseType={audioState.noiseType}
            setNoiseType={audioState.setNoiseType}
          />
        </div>
        <FrequencyCanvas
          solfeggioFreq={SOLFEGGIO_FREQ[audioState.solfeggio]}
          binauralFreqMin={BINAURAL_FREQ[audioState.binaural].min}
          binauralFreqMax={BINAURAL_FREQ[audioState.binaural].max}
          onFrequencyChange={handleFrequencyChange}
          oscillatorOptions={audioState.oscillatorOptions}
          beat={audioState.beat}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
