import {
  PlayArrowOutlined,
  ShuffleOutlined,
  StopOutlined,
} from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";

interface Props {
  isPlaying: boolean;
  beat: number;
  onPlay: () => void;
  onRandomize: () => void;
}

export function PlayControls({ isPlaying, beat, onPlay, onRandomize }: Props) {
  return (
    <div>
      <Button
        variant={isPlaying ? "contained" : "outlined"}
        color={isPlaying ? "primary" : "secondary"}
        onClick={onPlay}
        sx={{ margin: "1rem" }}
      >
        {isPlaying ? <StopOutlined /> : <PlayArrowOutlined />}
      </Button>
      <Button
        variant="contained"
        disabled={!isPlaying}
        onClick={onRandomize}
        sx={{ margin: "1rem" }}
      >
        <ShuffleOutlined />
      </Button>
    </div>
  );
}
