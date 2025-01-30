import { ButtonGroup, Button, IconButton } from '@mui/material';
import { GraphicEqOutlined } from '@mui/icons-material';
import { BINAURAL_FREQ } from '../constants';

interface Props {
  binaural: keyof typeof BINAURAL_FREQ;
  setBinaural: (value: keyof typeof BINAURAL_FREQ) => void;
}

export function BinauralControls({ binaural, setBinaural }: Props) {
  return (
    <div>
      <div>
        <IconButton color="secondary">
          <GraphicEqOutlined />
        </IconButton>
      </div>
      <ButtonGroup 
        orientation="vertical" 
        variant="contained"
        sx={{ '& .MuiButton-root': { marginBottom: '8px' } }}
      >
        {Object.keys(BINAURAL_FREQ).map((key) => (
          <Button
            key={key}
            onClick={() => setBinaural(key as keyof typeof BINAURAL_FREQ)}
            variant={binaural === key ? 'contained' : 'outlined'}
            color="primary"
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
} 