import {
  PlayArrowOutlined,
  ShuffleOutlined,
  StopOutlined,
  SpeedOutlined,
} from "@mui/icons-material";
import { Button } from "@mui/material";

interface Props {
  isPlaying: boolean;
  beat: number;
  isDrifting: boolean;
  onPlay: () => void;
  onRandomize: () => void;
  onDrift: () => void;
}

export function PlayControls({ 
  isPlaying, 
  beat, 
  isDrifting, 
  onPlay, 
  onRandomize, 
  onDrift 
}: Props) {
  return (
    <div>
      <Button
        size="large"
        variant={isPlaying ? "contained" : "outlined"}
        color={isPlaying ? "primary" : "secondary"}
        onClick={onPlay}
        sx={{ margin: "1rem" }}
      >
        {isPlaying ? <StopOutlined /> : <PlayArrowOutlined />}
      </Button>
      <Button
        size="small"
        variant="contained"
        disabled={!isPlaying}
        onClick={onRandomize}
        sx={{ margin: "1rem" }}
      >
        <ShuffleOutlined />
      </Button>
      <Button
        size="large"
        variant={isDrifting ? "contained" : "outlined"}
        color={isDrifting ? "primary" : "secondary"}
        disabled={!isPlaying}
        onClick={onDrift}
        sx={{ margin: "1rem" }}
      >
        <SpeedOutlined />
      </Button>
    </div>
  );
}
