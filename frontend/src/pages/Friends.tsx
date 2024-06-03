import React, { useRef, Suspense } from "react";
import { useSelector } from "react-redux";
import { useLoaderData, defer, Await } from "react-router-dom";
import { Button, Input } from "@mui/material";
import axios from "axios";
import Friend from "../components/Friend";

const FriendsPage: React.FC = () => {
  const userID = useSelector((state: any) => state.auth.user._id);
  const inputRef = useRef<HTMLInputElement>(null);
  const { friends } = useLoaderData() as { friends: Object[] };

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

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const friendID = inputRef.current?.value;
    await addFriend(friendID!);
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
      <form onSubmit={handleFormSubmit}>
        <Input
          size="medium"
          inputRef={inputRef}
          inputProps={{
            style: {
              backgroundColor: "white",
              color: "black",
              textAlign: "center",
            },
          }}
        />
        <Button
          variant="contained"
          size="medium"
          type="submit"
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
          Submit
        </Button>
      </form>
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

export const loader = async (authCheck: () => {}) => {
  const auth: boolean = authCheck() === true;

  if (auth) {
    return defer({
      friends: loadFriends(),
    });
  }
};

export default FriendsPage;
