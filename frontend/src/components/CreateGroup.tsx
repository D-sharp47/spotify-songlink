import {
  Button,
  Stack,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  DialogActions,
  Typography,
  Card,
} from "@mui/material";
import { useSelector } from "react-redux";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StoreType } from "../util/types";
import { createGroup, getFriends } from "../util/api";
import { friendDisplay } from "../pages/Friends";

interface CreateGroupModalContentProps {
  toggleGroupModal: () => void;
}

const CreateGroupModalContent: React.FC<CreateGroupModalContentProps> = (
  props
) => {
  const playlistTypes = ["Short Term", "Medium Term", "Long Term"];
  const userId = useSelector((state: StoreType) => state.auth.user._id);
  const isLoggedIn = useSelector(
    (state: StoreType) => state.auth.isAuthenticated
  );
  const [groupName, setGroupName] = useState("");
  const [groupNameError, setGroupNameError] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>([userId]);
  const [playlists, setPlaylists] = useState<string[]>(playlistTypes);
  const queryClient = useQueryClient();

  console.log("Group Members: ", groupMembers);

  const { data: friends, isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: isLoggedIn && !!userId,
    staleTime: 30 * 60 * 1000,
  });

  const toggleMember = (member: string) => {
    if (groupMembers.includes(member)) {
      setGroupMembers(groupMembers.filter((m) => m !== member));
    } else {
      setGroupMembers([...groupMembers, member]);
    }
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
      props.toggleGroupModal();
      const response = await createGroup(groupName, groupMembers, playlists);

      if (response && response.status < 300) {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
      }
    } catch (err) {
      alert("Error creating group");
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
        {!loadingFriends &&
          friends.some((f: friendDisplay) => f.status === "friends") && (
            <>
              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{
                    fontSize: "1.5em",
                    marginBottom: "1rem",
                    "&.Mui-focused": {
                      color: "rgb(0 0 0 / 75%)",
                    },
                  }}
                >
                  Add Group Members
                </FormLabel>
                <Card
                  sx={{
                    padding: "0 1rem 1rem 1rem",
                    marginBottom: "1rem",
                    border: "1px solid #c4c4c4",
                    boxShadow: "none",
                    maxHeight: "178px",
                    overflowY: "auto",
                  }}
                >
                  <FormGroup aria-label="position" sx={{ width: "100%" }}>
                    {friends.map((f: friendDisplay) => {
                      if (f.status === "friends") {
                        return (
                          <FormControlLabel
                            key={f.friendId}
                            sx={{ mt: "1rem" }}
                            control={
                              <Checkbox
                                sx={{
                                  "&.Mui-checked": { color: "#47a661" },
                                }}
                                onChange={() => {
                                  toggleMember(f.friendId);
                                }}
                              />
                            }
                            label={
                              <Stack
                                direction="column"
                                spacing={0}
                                key={f.friendId}
                              >
                                <Typography variant="body1" sx={{ mr: "1rem" }}>
                                  {f.friendName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "gray", ml: "0.5rem" }}
                                >
                                  @{f.friendId}
                                </Typography>
                              </Stack>
                            }
                          />
                        );
                      }
                    })}
                  </FormGroup>
                </Card>
              </FormControl>
            </>
          )}

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
