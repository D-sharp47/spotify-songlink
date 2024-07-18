import React from "react";

import { Card, CardContent, Typography, Button } from "@mui/material";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "https://songlink.co"; // Forcing for now

const Welcome: React.FC = () => {
  const handleClick = () => {
    window.location.href = `${backendUrl}/api/auth`;
  };

  return (
    <>
      <Card
        sx={{
          maxWidth: 600,
          padding: 2,
          marginBottom: 2,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: ".3rem",
              textDecoration: "none",
            }}
          >
            Welcome to SongLink
          </Typography>
          <Typography variant="h5" component="h2">
            Discover and Share Music with Friends
          </Typography>
          <Typography variant="body1" color="textSecondary">
            SongLink allows you to create shared playlists with your friends
            based on your most frequently listened to songs on Spotify. Connect,
            share, and enjoy music together!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleClick}
            sx={{
              marginTop: 2,
              alignSelf: "center",
              backgroundColor: "#47a661",
              "&:hover": {
                backgroundColor: "#367a4e",
              },
            }}
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default Welcome;
