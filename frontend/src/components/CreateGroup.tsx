import { Button, Stack, Typography, TextField } from "@mui/material";
import React, { useState, useRef } from "react";
import SearchUsers from "./SearchUsers"; // Assuming the correct import path

const CreateGroupModalContent: React.FC = () => {
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const searchUsersRef = useRef<any>(null); // useRef for accessing the SearchUsers component

  const handleAddMember = () => {
    const selectedUser = searchUsersRef.current.getSelectedUser();
    if (selectedUser) {
      setGroupMembers([...groupMembers, selectedUser]);
      searchUsersRef.current && searchUsersRef.current.clearInput();
    }
  };

  return (
    <Stack direction="column" style={{ marginBottom: "40px" }}>
      <Typography variant="h4" style={{ marginBottom: "20px" }}>
        Group Name
      </Typography>
      <TextField
        sx={{ width: "100%" }}
        variant="outlined"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <Typography
        variant="h4"
        style={{ marginBottom: "20px", marginTop: "20px" }}
      >
        Group Members
      </Typography>
      <Stack
        direction="row"
        alignItems="center"
        style={{ marginBottom: "20px" }}
      >
        <SearchUsers ref={searchUsersRef} />
        <Button
          variant="contained"
          size="large"
          onClick={handleAddMember}
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
    </Stack>
  );
};

export default CreateGroupModalContent;
