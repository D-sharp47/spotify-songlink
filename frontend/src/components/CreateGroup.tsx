import {
  Button,
  Stack,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  IconButton,
  DialogActions,
} from "@mui/material";
import { useSelector } from "react-redux";
import React, { useState, useRef } from "react";
import SearchUsers from "./SearchUsers";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";

interface CreateGroupModalContentProps {
  toggleGroupModal: () => void;
}

const CreateGroupModalContent: React.FC<CreateGroupModalContentProps> = (
  props
) => {
  const playlistTypes = ["Short Term", "Medium Term", "Long Term", "Custom"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = useSelector((state: any) => state.auth.user._id);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([userId]);
  const [playlists, setPlaylists] = useState<string[]>(playlistTypes);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchUsersRef = useRef<any>(null);

  const handleAddMember = () => {
    const selectedUser = searchUsersRef.current.getSelectedUser();
    if (selectedUser) {
      setGroupMembers([...groupMembers, selectedUser]);
      searchUsersRef.current && searchUsersRef.current.clearInput();
    }
  };

  const handleMemberDelete = (member: string) => {
    setGroupMembers(groupMembers.filter((m) => m !== member));
  };

  const handleCheckboxChange = (playlist: string) => {
    if (playlists.includes(playlist)) {
      setPlaylists(playlists.filter((p) => p !== playlist));
    } else {
      setPlaylists([...playlists, playlist]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/groups/create", {
        name: groupName,
        members: groupMembers,
        playlists,
      });

      if (response.status < 300) {
        props.toggleGroupModal();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column">
        <Typography variant="h6" style={{ marginBottom: "20px" }}>
          Group Name
        </Typography>
        <TextField
          sx={{ width: "100%" }}
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <Typography
          variant="h6"
          style={{ marginBottom: "20px", marginTop: "20px" }}
        >
          Group Members
        </Typography>
        <Stack direction="row" alignItems="center">
          <SearchUsers sxProps={{ width: "64vh" }} ref={searchUsersRef} />
          <Button
            variant="contained"
            size="large"
            onClick={handleAddMember}
            sx={{
              my: "1rem",
              ml: "1rem",
              width: "6.5rem",
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
        <Stack direction="row" spacing={1} sx={{ mb: "1.5rem" }}>
          {groupMembers.map((member) => (
            <Box
              key={member}
              sx={{
                mt: "1rem",
                border: "1px solid #47a661",
                backgroundColor: "#f0f8f2",
                padding: "0.5rem",
                borderRadius: "1rem",
                whiteSpace: "nowrap",
              }}
            >
              {member}
              {member !== userId && (
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => handleMemberDelete(member)}
                  sx={{
                    top: 0,
                    right: 0,
                    ml: "0.5rem",
                    "&:hover": {
                      background: "#73cc86",
                    },
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
        </Stack>
        <FormControl component="fieldset">
          <FormLabel
            component="legend"
            sx={{
              textAlign: "center",
              fontSize: "1.5em",
              marginBottom: "1rem",
              "&.Mui-focused": {
                color: "rgb(0 0 0 / 75%)",
              },
            }}
          >
            Choose Playlists
          </FormLabel>
          <FormGroup
            aria-label="position"
            row
            sx={{ width: "100%", justifyContent: "center" }}
          >
            {playlistTypes.map((playlist) => (
              <FormControlLabel
                key={playlist}
                control={
                  <Checkbox
                    defaultChecked
                    sx={{ "&.Mui-checked": { color: "#47a661" } }}
                    onChange={() => handleCheckboxChange(playlist)}
                  />
                }
                label={playlist}
                labelPlacement="top"
              />
            ))}
          </FormGroup>
        </FormControl>
      </Stack>
      <DialogActions sx={{ margin: "1rem" }}>
        <Button
          variant="outlined"
          sx={{
            width: { md: "4.5rem" },
            paddingLeft: "0rem",
            marginRight: "1rem",
            color: "#47a661",
            borderColor: "#47a661",
            textAlign: "center",
            padding: "0.5rem",
          }}
          onClick={props.toggleGroupModal}
        >
          Close
        </Button>
        <Button
          // disabled={
          //     !props.responseText ||
          //     props.responseText.length > REVIEW_RESPONSE_MAX_LENGTH ||
          //     (props.editMode && props.responseText === props.initialResponse)
          // }
          variant="contained"
          type="submit"
          sx={{
            whiteSpace: "nowrap",
            padding: "0.5rem",
            width: "6.5rem",
            justifyContent: "center",
            backgroundColor: "#47a661",
            "&:hover": {
              backgroundColor: "#367a4e",
            },
            color: "white",
          }}
          // TODO: finish this
          onClick={() => {}}
        >
          Create
        </Button>
      </DialogActions>
    </form>
  );
};

export default CreateGroupModalContent;
