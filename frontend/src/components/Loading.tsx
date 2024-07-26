import React from "react";
import { Box } from "@mui/material";
import CustomIcon from "../assets/CustomIcon";

const Loading: React.FC<{ fontSize: string }> = ({ fontSize }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh", // Make it full screen
        "@keyframes pulse": {
          "0%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.1)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
        animation: "pulse 1.5s infinite",
      }}
    >
      <CustomIcon
        sx={{
          fontSize: { fontSize },
        }}
      />
    </Box>
  );
};

export default Loading;
