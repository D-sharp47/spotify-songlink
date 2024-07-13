import React from "react";

import { Card, CardContent, Typography, IconButton, Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { NavLink } from "react-router-dom";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { deleteGroup } from "../util/api";

export interface GroupProps {
  readonly _id: string;
  readonly name: string;
  readonly members: object[];
  readonly playlists: object[];
  readonly settings: object;
}

const GroupCard: React.FC<GroupProps> = (props) => {
  const queryClient = useQueryClient();

  const handleDeleteClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      await deleteGroup(props._id);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError.response?.data);
    }
  };
  return (
    <NavLink to={`${props._id}`} style={{ textDecoration: "none" }}>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card
          sx={{
            position: "relative",
            height: "200px",
            width: "200px",
            padding: "1rem",
            backgroundColor: "#47a661",
            color: "white",
            borderRadius: "1rem",
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
            <Typography variant="h5" component="div">
              {props.name}
            </Typography>
            <IconButton
              className="deleteIcon"
              onClick={handleDeleteClick}
              sx={{
                position: "absolute",
                top: 0,
                color: "white",
                right: 0,
                display: "none",
              }}
            >
              <DeleteIcon />
            </IconButton>
          </CardContent>
        </Card>
      </Grid>
    </NavLink>
  );
};

export default GroupCard;
