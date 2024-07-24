import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { AxiosError } from "axios";
import { acceptFriend, deleteFriend } from "../util/api";

export interface FriendProps {
  readonly friendId: string;
  readonly friendName: string;
  readonly friendProfileImages: {
    url: string;
    height: number;
    width: number;
  }[];
  readonly friendStatus: string;
}

const actionDict: { [key: string]: string } = {
  req_out: "Unsend",
  req_in: "Decline",
  friends: "Remove",
};

const Friend: React.FC<FriendProps> = (props) => {
  const { friendId, friendName, friendProfileImages, friendStatus } = props;

  const handleRemove = async () => {
    try {
      await deleteFriend(friendId);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError.response?.data);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptFriend(friendId);
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
          }}
        >
          <Stack direction="row" spacing={2}>
            <IconButton onClick={() => {}} sx={{ p: 0 }}>
              <Avatar src={friendProfileImages[0]?.url}>
                {friendProfileImages[0]
                  ? ""
                  : friendName.slice(0, 1).toUpperCase() ?? "?"}
              </Avatar>
            </IconButton>
            <Stack direction="column" spacing={0}>
              <Typography variant="body1" sx={{ color: "white", mr: "1rem" }}>
                {friendName}
              </Typography>
              <Typography variant="body2" sx={{ color: "gray" }}>
                @{friendId}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2}>
            {friendStatus === "req_in" && (
              <Button
                variant="contained"
                size="small"
                onClick={handleAccept}
                sx={{
                  backgroundColor: "#47a661",
                  "&:hover": {
                    backgroundColor: "#367a4e",
                  },
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
                backgroundColor: "#FF334B",
                "&:hover": {
                  backgroundColor: "#CC2C3F",
                },
                color: "white",
              }}
            >
              {actionDict[friendStatus]}
            </Button>
          </Stack>
        </Box>
      </div>
    </>
  );
};

export default Friend;
