import { Button, Input } from "@mui/material";
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const FriendsPage: React.FC = () => {
  const userID = useSelector((state: any) => state.auth.user._id);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFriend = async (friendID: string) => {
    try {
      const response = await axios.post(`/api/friends/add/${friendID}`);
      console.log(response.data);
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const friendID = inputRef.current?.value;
    await addFriend(friendID!);
    console.log("Add friend: ", friendID);
  };

  return (
    <>
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

export default FriendsPage;
