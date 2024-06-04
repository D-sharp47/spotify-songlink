import React, { useRef, Suspense } from "react";
import { useSelector } from "react-redux";
import { useLoaderData, defer, Await } from "react-router-dom";
import { Button, Stack } from "@mui/material";
import axios from "axios";
import Friend from "../components/Friend";
import SearchUsers from "../components/SearchUsers";

const FriendsPage: React.FC = () => {
  // Todo: Fix state: any errors/warnings
  const userID = useSelector((state: any) => state.auth.user._id);
  const searchUsersRef = useRef<any>(null);
  const { friends } = useLoaderData() as { friends: object[] };

  const addFriend = async (friendID: string) => {
    try {
      const response = await axios.post(`/api/friends/add/${friendID}`);
      if (response.status < 300) {
        // Update the friends list
      }
    } catch (error: any) {
      console.error(error.response.data);
    }
  };

  const handleFormSubmit = async () => {
    const friendID = searchUsersRef.current.getSelectedUser();
    if (friendID) {
      await addFriend(friendID);
      searchUsersRef.current && searchUsersRef.current.clearInput();
    }
  };

  return (
    <>
      <Suspense
        fallback={
          <p style={{ textAlign: "center", color: "white" }}>
            Loading Friends...
          </p>
        }
      >
        <Await resolve={friends}>
          {(loadedFriends) => (
            <>
              <h1 style={{ color: "white" }}>{userID}: Friends</h1>
              <ul>
                {loadedFriends.map(
                  (f: { friendId: string; status: string }) => (
                    <Friend
                      key={f.friendId}
                      id={f.friendId}
                      status={f.status}
                    />
                  )
                )}
              </ul>
            </>
          )}
        </Await>
      </Suspense>
      <h1 style={{ color: "white" }}>{userID}: Add Friends</h1>
      <Stack
        direction="row"
        alignItems="center"
        style={{ marginBottom: "20px" }}
      >
        <SearchUsers sxProps={{ width: "12vw" }} ref={searchUsersRef} />
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

const loadFriends = async () => {
  const response = await axios.get(`/api/friends`);
  if (response.status < 300) {
    return response.data;
  }
  return [];
};

export const loader = async (authCheck: () => unknown) => {
  // Todo: Fix unknown type
  const auth: boolean = authCheck() === true;

  if (auth) {
    return defer({
      friends: loadFriends(),
    });
  }
};

export default FriendsPage;
