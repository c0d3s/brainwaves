import { ButtonGroup, Button, IconButton, Box } from "@mui/material";
import { WaterOutlined } from "@mui/icons-material";
import { BASE_FREQ, BASE_FREQ_COLUMNS } from "../constants";

interface Props {
  base: keyof typeof BASE_FREQ;
  setBase: (value: keyof typeof BASE_FREQ) => void;
}

export function BaseControls({ base, setBase }: Props) {
  // Define which frequencies go in which column
  const column2Keys = Object.entries(BASE_FREQ_COLUMNS).filter(([_, value]) => value === 1).map(([key]) => key);
  const column1Keys = Object.entries(BASE_FREQ_COLUMNS).filter(([_, value]) => value === 2).map(([key]) => key);
  const column0Keys = Object.keys(BASE_FREQ).filter((value) => !column1Keys.includes(value) && !column2Keys.includes(value));

  const renderButtonGroup = (keys: string[]) => (
    <ButtonGroup
      orientation="vertical"
      variant="contained"
      sx={{
        "& .MuiButton-root": {
          marginBottom: "8px",
          borderColor: "primary.main",
          "&:last-child": {
            marginBottom: 0,
            borderColor: "primary.main",
          },
        },
      }}
    >
      {keys.map((key) => (
        <Button
          key={key}
          onClick={() => setBase(key as keyof typeof BASE_FREQ)}
          variant={base === key ? "contained" : "outlined"}
          color={base === key ? "primary" : "secondary"}
        >
          {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
        </Button>
      ))}
    </ButtonGroup>
  );

  return (
    <div>
      <div>
        <IconButton color="secondary">
          <WaterOutlined />
        </IconButton>
      </div>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        {renderButtonGroup(column0Keys)}
        {renderButtonGroup(column1Keys)}
        {renderButtonGroup(column2Keys)}
      </Box>
    </div>
  );
}
