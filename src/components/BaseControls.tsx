import { ButtonGroup, Button, IconButton, Box } from "@mui/material";
import { WaterOutlined } from "@mui/icons-material";
import { BASE_FREQ, BASE_FREQ_COLUMNS } from "../constants";
import { useState } from "react";

interface Props {
  base: keyof typeof BASE_FREQ;
  setBase: (value: keyof typeof BASE_FREQ) => void;
}

export function BaseControls({ base, setBase }: Props) {
  const [activeColumn, setActiveColumn] = useState(0);

  // Define which frequencies go in which column
  const column2Keys = Object.entries(BASE_FREQ_COLUMNS)
    .filter(([_, value]) => value === 1)
    .map(([key]) => key);
  const column1Keys = Object.entries(BASE_FREQ_COLUMNS)
    .filter(([_, value]) => value === 2)
    .map(([key]) => key);
  const column0Keys = Object.keys(BASE_FREQ).filter(
    (value) => !column1Keys.includes(value) && !column2Keys.includes(value),
  );

  const rotateColumn = () => {
    setActiveColumn((prev) => (prev + 1) % 3);
  };

  const renderButtonGroup = (keys: string[]) => (
    <ButtonGroup
      orientation="horizontal"
      variant="contained"
      sx={{
        "& .MuiButton-root": {
          marginRight: "8px",
          borderColor: "primary.main",
          "&:last-child": {
            marginRight: 0,
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
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <IconButton color="secondary" onClick={rotateColumn}>
        <WaterOutlined />
      </IconButton>
      <Box sx={{}}>
        {activeColumn === 0 && renderButtonGroup(column0Keys)}
        {activeColumn === 1 && renderButtonGroup(column1Keys)}
        {activeColumn === 2 && renderButtonGroup(column2Keys)}
      </Box>
    </div>
  );
}
