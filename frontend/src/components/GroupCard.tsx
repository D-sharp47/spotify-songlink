import React from "react";

import { Card, CardContent, Typography, IconButton, Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export interface GroupProps {
  readonly _id: string;
  readonly name: string;
  readonly members: Object[];
  readonly playlists: Object[];
  readonly settings: Object;
}

const GroupCard: React.FC<GroupProps> = (props) => {
  return (
    <>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card
          sx={{
            position: "relative",
            height: "100%",
            "&:hover .deleteIcon": {
              display: "block",
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="h5" component="div" sx={{ mb: 2 }}>
              {props.name}
            </Typography>
            <IconButton
              className="deleteIcon"
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                transform: "translate(50%, -50%)", // Move it to the top right corner
                display: "none",
              }}
            >
              <DeleteIcon />
            </IconButton>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default GroupCard;
