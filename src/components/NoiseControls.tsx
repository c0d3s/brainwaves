import { ButtonGroup, Button, IconButton } from '@mui/material';
import { AirOutlined } from '@mui/icons-material';

type NoiseType = 'white' | 'pink' | 'brown' | 'off';

interface Props {
  noiseType: NoiseType;
  setNoiseType: (value: NoiseType) => void;
}

export function NoiseControls({ noiseType, setNoiseType }: Props) {
  return (
    <div>
      <div>
        <IconButton color="secondary">
          <AirOutlined />
        </IconButton>
      </div>
      <ButtonGroup 
        orientation="vertical" 
        variant="contained"
        sx={{ 
            '& .MuiButton-root': { 
              marginBottom: '8px',
              borderColor: 'primary.main',
              '&:last-child': {
                marginBottom: 0,
                borderColor: 'primary.main',
              }
            }
          }}
        >
        {['off', 'white', 'pink', 'brown'].map((type) => (
          <Button
            key={type}
            onClick={() => setNoiseType(type as NoiseType)}
            variant={noiseType === type ? 'contained' : 'outlined'}
            color={noiseType === type ? 'primary' : 'secondary'}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
} 