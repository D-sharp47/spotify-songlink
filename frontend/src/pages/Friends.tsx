import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Box, Button, Card, Grid, Stack, Typography } from "@mui/material";
import Friend from "../components/Friend";
import SearchUsers from "../components/SearchUsers";
import { addFriend, getFriends } from "../util/api";
import { StoreType } from "../util/types";

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
          <Stack direction="row" sx={{ alignItems: "center", mb: "1.5rem" }}>
            <Typography sx={{ color: "#47a661", mr: "1rem", flex: "none" }}>
              {userID}: Friends
            </Typography>
            <Button
              variant="contained"
              size="medium"
              sx={{
                backgroundColor: "#47a661",
                "&:hover": {
                  backgroundColor: "#367a4e",
                },
                color: "white",
                mr: "1rem",
                flex: "none",
              }}
            >
              Requests
            </Button>
            <div style={{ width: "20rem" }}>
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
                width: "40rem",
                p: "1rem",
                justifyContent: "center",
              }}
            >
              <Stack direction="column" spacing={2}>
                <Typography
                  variant="body2"
                  sx={{ color: "gray", ml: "0.5rem", mt: "0.5rem" }}
                >
                  Incoming Requests
                </Typography>
                {friends.map(
                  (f: {
                    friendId: string;
                    friendName: string;
                    friendProfileImages: {
                      url: string;
                      height: number;
                      width: number;
                    }[];
                    status: string;
                  }) => {
                    if (f.status === "req_in") {
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
                  }
                )}

                <Typography
                  variant="body2"
                  sx={{ color: "gray", ml: "0.5rem", mt: "0.5rem" }}
                >
                  Outgoing Requests
                </Typography>

                {friends.map(
                  (f: {
                    friendId: string;
                    friendName: string;
                    friendProfileImages: {
                      url: string;
                      height: number;
                      width: number;
                    }[];
                    status: string;
                  }) => {
                    if (f.status === "req_out") {
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
                  }
                )}

                <Typography
                  variant="body2"
                  sx={{ color: "gray", ml: "0.5rem", mt: "0.5rem" }}
                >
                  Friends
                </Typography>

                {friends.map(
                  (f: {
                    friendId: string;
                    friendName: string;
                    friendProfileImages: {
                      url: string;
                      height: number;
                      width: number;
                    }[];
                    status: string;
                  }) => {
                    if (f.status === "friends") {
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
                  }
                )}
              </Stack>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default FriendsPage;
