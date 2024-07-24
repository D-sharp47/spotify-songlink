import {
  Button,
  Stack,
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
import { useQueryClient } from "@tanstack/react-query";
import { StoreType } from "../util/types";
import { createGroup } from "../util/api";

interface CreateGroupModalContentProps {
  toggleGroupModal: () => void;
}

const CreateGroupModalContent: React.FC<CreateGroupModalContentProps> = (
  props
) => {
  const playlistTypes = ["Short Term", "Medium Term", "Long Term"];
  const userId = useSelector((state: StoreType) => state.auth.user._id);
  const [groupName, setGroupName] = useState("");
  const [groupNameError, setGroupNameError] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>([userId]);
  const [playlists, setPlaylists] = useState<string[]>(playlistTypes);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchUsersRef = useRef<any>(null);
  const queryClient = useQueryClient();

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
    if (groupName === "") {
      setGroupNameError(true);
      return;
    }

    try {
      const response = await createGroup(groupName, groupMembers, playlists);

      if (response && response.status < 300) {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        props.toggleGroupModal();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column">
        <TextField
          sx={{ width: "100%", marginY: "2rem" }}
          label="Group Name*"
          error={groupNameError}
          helperText={groupNameError ? "Group name is required" : ""}
          variant="outlined"
          value={groupName}
          onChange={(e) => {
            setGroupNameError(false);
            setGroupName(e.target.value);
          }}
        />
        <Stack direction="row" alignItems="center">
          <SearchUsers
            label="Group Members"
            textFieldSize="medium"
            ref={searchUsersRef}
          />
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
                paddingX: "0.5rem",
                height: "40px",
                display: "flex",
                alignItems: "center",
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
          // onClick={() => {}}
        >
          Create
        </Button>
      </DialogActions>
    </form>
  );
};

export default CreateGroupModalContent;
