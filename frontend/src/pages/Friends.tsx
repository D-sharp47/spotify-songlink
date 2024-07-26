import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import Friend from "../components/Friend";
import SearchUsers from "../components/SearchUsers";
import { addFriend, getFriends } from "../util/api";
import { StoreType } from "../util/types";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardControlKeyIcon from "@mui/icons-material/KeyboardControlKey";
import PeopleIcon from "@mui/icons-material/People";

const FriendsPage: React.FC = () => {
  const userID = useSelector((state: StoreType) => state.auth.user._id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchUsersRef = useRef<any>(null);
  const isLoggedIn = useSelector(
    (state: StoreType) => state.auth.isAuthenticated
  );

  const { data: friends, isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: isLoggedIn && !!userID,
    staleTime: 30 * 60 * 1000,
  });

  const handleAddFriend = async (friendID: string) => {
    try {
      await addFriend(friendID);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError.response?.data);
    }
  };

  const handleFormSubmit = async () => {
    const friendID = searchUsersRef.current.getSelectedUser();
    if (friendID) {
      await handleAddFriend(friendID);
      searchUsersRef.current && searchUsersRef.current.clearInput();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      {loadingFriends ? (
        <p style={{ textAlign: "center", color: "white" }}>
          Loading Friends...
        </p>
      ) : (
        <>
          <Stack
            direction="row"
            sx={{ alignItems: "center", mb: "1.5rem", width: "50%" }}
          >
            <Typography sx={{ color: "#47a661", mr: "0.5rem", flex: "none" }}>
              Friends
            </Typography>
            <PeopleIcon sx={{ color: "#47a661", mr: "1rem" }} />

            <div style={{ flex: 1 }}>
              <SearchUsers
                label="Search Users"
                textFieldSize="small"
                ref={searchUsersRef}
              />
            </div>
            <Button
              variant="contained"
              size="medium"
              onClick={handleFormSubmit}
              sx={{
                ml: "1rem",
                backgroundColor: "#47a661",
                "&:hover": {
                  backgroundColor: "#367a4e",
                },
                color: "white",
              }}
            >
              Add
            </Button>
          </Stack>
          {friends?.length > 0 && (
            <Card
              sx={{
                backgroundColor: "#2B2B2B",
                width: "50%",
                p: "1rem",
                justifyContent: "center",
                maxHeight: "728px",
                overflowY: "auto",
              }}
            >
              <Stack direction="column" spacing={2}>
                <FriendsMap friends={friends} status="req_out" />
                <FriendsMap friends={friends} status="req_in" />
                <FriendsMap friends={friends} status="friends" />
              </Stack>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export type friendDisplay = {
  friendId: string;
  friendName: string;
  friendProfileImages: {
    url: string;
    height: number;
    width: number;
  }[];
  status: string;
};

const FriendsMap: React.FC<{
  friends: friendDisplay[];
  status: string;
}> = (props) => {
  const { friends, status } = props;
  let msg;
  switch (status) {
    case "req_out":
      msg = "Outgoing Requests";
      break;
    case "req_in":
      msg = "Incoming Requests";
      break;
    case "friends":
      msg = "Friends";
      break;
  }

  const [visible, setVisible] = React.useState(true);

  return (
    <>
      {friends.some((f: friendDisplay) => f.status === status) && (
        <>
          <Stack direction="row" sx={{ alignItems: "center", mt: "0.5rem" }}>
            <Button onClick={() => setVisible(!visible)}>
              <Typography variant="body2" sx={{ color: "gray" }}>
                {msg}
              </Typography>

              {visible ? (
                <KeyboardArrowDownIcon sx={{ color: "gray", ml: "0.5rem" }} />
              ) : (
                <KeyboardControlKeyIcon sx={{ color: "gray", ml: "0.5rem" }} />
              )}
            </Button>
          </Stack>
          {visible &&
            friends.map((f: friendDisplay) => {
              if (f.status === status) {
                return (
                  <Friend
                    key={f.friendId}
                    friendId={f.friendId}
                    friendName={f.friendName}
                    friendProfileImages={f.friendProfileImages}
                    friendStatus={f.status}
                  />
                );
              }
            })}
        </>
      )}
    </>
  );
};

export default FriendsPage;
