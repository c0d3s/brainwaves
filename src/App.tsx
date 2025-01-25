import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import * as Tone from 'tone';
import { Radio, RadioGroup, FormControlLabel } from '@mui/material';

const SOFLEGGIO_FREQ = {
  foundation: 174,
  healing: 285,
  ut: 396,
  re: 417,
  mi: 528,
  fa: 639,
  sol: 741,
  la: 852,
  universe: 963,
}

const BINAURAL_FREQ = {
  delta: {
    min: 1,
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
    min: 14,
    max: 30,
  },
  gamma: {
    min: 30,
    max: 100,
  },
}

const calcFreq = (side: 'left' | 'right', solfeggio: keyof typeof SOFLEGGIO_FREQ, binaural: keyof typeof BINAURAL_FREQ) => {
  const solfeggioFreq = SOFLEGGIO_FREQ[solfeggio];
  if (side === 'left') return solfeggioFreq;
  const binauralFreq = BINAURAL_FREQ[binaural];
  const min = binauralFreq.min;
  const max = binauralFreq.max;
  return Math.floor(Math.random() * (max - min + 1)) + min + solfeggioFreq;
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sofleggio, setSofleggio] = useState<keyof typeof SOFLEGGIO_FREQ>('ut');
  const [binaural, setBinaural] = useState<keyof typeof BINAURAL_FREQ>('alpha');
  const [noiseType, setNoiseType] = useState<'white' | 'pink' | 'brown'>('white');

  const updateFrequencies = () => {
    const leftFreq = calcFreq('left', sofleggio, binaural);
    const rightFreq = calcFreq('right', sofleggio, binaural);
    setLeftOptions({frequency: leftFreq, pan: -1});
    setRightOptions({frequency: rightFreq, pan: 1});
    console.log('left', leftOptions, 'right', rightOptions, 'noise', noiseType);
    if (isPlaying) {
      synthLeft.current.frequency.setValueAtTime(leftFreq, Tone.now());
      synthRight.current.frequency.setValueAtTime(rightFreq, Tone.now());
      synthNoise.current.type = noiseType;
    }
  }

  const [leftOptions, setLeftOptions] = useState({
    frequency: 440,
    pan: -1,
  });
  const [rightOptions, setRightOptions] = useState({
    frequency: 442,
    pan: 1,
  });

  const synthLeft = useRef(new Tone.Synth({
    oscillator: {
      type: "sine",
      volume: -20,
    }
  }).connect(new Tone.Panner(leftOptions.pan).toDestination()));

  const synthRight = useRef(new Tone.Synth({
    oscillator: {
      type: "sine",
      volume: -20,
    }
  }).connect(new Tone.Panner(rightOptions.pan).toDestination()));

  const synthNoise = useRef(new Tone.Noise({
    type: noiseType,
    volume: -20,
  }).connect(new Tone.Panner(0).toDestination()));

  const playTone = async () => {
    const { frequency: leftFrequency } = leftOptions;
    const { frequency: rightFrequency } = rightOptions;

    setLeftOptions({
      frequency: calcFreq('left', sofleggio, binaural),
      pan: -1,
    });
    setRightOptions({
      frequency: calcFreq('right', sofleggio, binaural),
      pan: 1,
    });
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
    if (!isPlaying) {
      synthLeft.current.triggerAttack(leftFrequency);
      synthRight.current.triggerAttack(rightFrequency);
      synthNoise.current.start();
    } else {
      synthLeft.current.triggerRelease();
      synthRight.current.triggerRelease();
      synthNoise.current.stop();
    }
    setIsPlaying(!isPlaying);
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Solfeggio + Binaural</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <div>
            <RadioGroup
              value={sofleggio}
              onChange={(e) => {
                setSofleggio(e.target.value as keyof typeof SOFLEGGIO_FREQ);
                updateFrequencies();
              }}
            >
              <p>Base Frequency</p>
              <FormControlLabel value="foundation" control={<Radio />} label="Foundation" />
              <FormControlLabel value="healing" control={<Radio />} label="Healing" /> 
              <FormControlLabel value="ut" control={<Radio />} label="Ut" />
              <FormControlLabel value="re" control={<Radio />} label="Re" />
              <FormControlLabel value="mi" control={<Radio />} label="Mi" />
              <FormControlLabel value="fa" control={<Radio />} label="Fa" />
              <FormControlLabel value="sol" control={<Radio />} label="Sol" />
              <FormControlLabel value="la" control={<Radio />} label="La" />
              <FormControlLabel value="universe" control={<Radio />} label="Universe" />
            </RadioGroup>
          </div>
          <div>
            <RadioGroup
              value={binaural}
              onChange={(e) => {
                setBinaural(e.target.value as keyof typeof BINAURAL_FREQ);
                updateFrequencies();
              }}
            >
              <p>Binaural Frequency</p>
              <FormControlLabel value="delta" control={<Radio />} label="Delta" />
              <FormControlLabel value="theta" control={<Radio />} label="Theta" />
              <FormControlLabel value="alpha" control={<Radio />} label="Alpha" />
              <FormControlLabel value="beta" control={<Radio />} label="Beta" />
              <FormControlLabel value="gamma" control={<Radio />} label="Gamma" />
            </RadioGroup>
          </div>
          <div>
            <RadioGroup
              value={noiseType}
              onChange={(e) => {
                setNoiseType(e.target.value as 'white' | 'pink' | 'brown');
                updateFrequencies();
              }}
            >
              <p>Noise Type</p>
              <FormControlLabel value="white" control={<Radio />} label="White" />
              <FormControlLabel value="pink" control={<Radio />} label="Pink" />
              <FormControlLabel value="brown" control={<Radio />} label="Brown" />
            </RadioGroup>
          </div>
        </div>
        <button onClick={() => playTone()}>
          {isPlaying ? 'stop' : 'play'}
        </button>
      </div>
    </>
  )
}

export default App
