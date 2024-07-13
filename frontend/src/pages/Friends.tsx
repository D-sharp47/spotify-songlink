import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button, Stack } from "@mui/material";
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
    <>
      {loadingFriends ? (
        <p style={{ textAlign: "center", color: "white" }}>
          Loading Friends...
        </p>
      ) : (
        <>
          <h1 style={{ color: "white" }}>{userID}: Friends</h1>
          <ul>
            {friends.map((f: { friendId: string; status: string }) => (
              <Friend key={f.friendId} id={f.friendId} status={f.status} />
            ))}
          </ul>
        </>
      )}
      <h1 style={{ color: "white" }}>{userID}: Add Friends</h1>
      <Stack
        direction="row"
        alignItems="center"
        style={{ marginBottom: "20px" }}
      >
        <SearchUsers label="Search Users" ref={searchUsersRef} />
        <Button
          variant="contained"
          size="large"
          onClick={handleFormSubmit}
          sx={{
            my: "1rem",
            ml: "1rem",
            backgroundColor: "#47a661",
            "&:hover": {
              backgroundColor: "#367a4e", // Your custom color for hover state
            },
            color: "white",
          }}
        >
          Add
        </Button>
      </Stack>
    </>
  );
};

export default FriendsPage;
