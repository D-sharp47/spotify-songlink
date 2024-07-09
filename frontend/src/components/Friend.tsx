import { Box, Button, Typography } from "@mui/material";
import axios from "../util/axiosApi";
import { AxiosError } from "axios";

export interface FriendProps {
  readonly id: string;
  readonly status: string;
}

const Friend: React.FC<FriendProps> = (props) => {
  const handleRemove = async () => {
    try {
      const response = await axios.delete(
        `/api/friends/remove?friendId=${props.id}`
      );
      if (response.status < 300) {
        // Update the friends list
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError.response?.data);
    }
  };

  const handleAccept = async () => {
    try {
      const response = await axios.put(
        `/api/friends/accept?friendId=${props.id}`
      );
      if (response.status < 300) {
        // Update the friends list
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError.response?.data);
    }
  };

  return (
    <>
      <div style={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "1rem",
          }}
        >
          <Typography variant="body1" sx={{ color: "white", mr: "1rem" }}>
            {props.id}
          </Typography>
          {props.status === "req_out" && (
            <div>
              <Typography variant="body1" sx={{ color: "gray", mr: "1rem" }}>
                Pending
              </Typography>
            </div>
          )}
          {props.status === "req_in" && (
            <Button
              variant="contained"
              size="small"
              onClick={handleAccept}
              sx={{
                backgroundColor: "#47a661",
                "&:hover": {
                  backgroundColor: "#367a4e",
                },
                mr: "1rem",
                color: "white",
              }}
            >
              Accept
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            onClick={handleRemove}
            sx={{
              backgroundColor: "#47a661",
              "&:hover": {
                backgroundColor: "#367a4e",
              },
              color: "white",
            }}
          >
            Remove
          </Button>
        </Box>
      </div>
    </>
  );
};

export default Friend;
