import {
  Button,
  Stack,
  DialogActions,
  Typography,
  Divider,
  TextField,
  Tooltip,
} from "@mui/material";
import { useSelector } from "react-redux";
import React from "react";
import { StoreType } from "../util/types";
import InfoIcon from "@mui/icons-material/Info";
import { GroupDetail } from "../pages/GroupDetail";
// import { useQuery, useQueryClient } from "@tanstack/react-query";

interface GroupSettingsProps {
  toggleGroupSettingsModal: () => void;
  group: GroupDetail;
}

const GroupSettings: React.FC<GroupSettingsProps> = (props) => {
  const { userId, isLoggedIn } = useSelector((state: StoreType) => {
    return {
      userId: state.auth.user._id,
      isLoggedIn: state.auth.isAuthenticated,
    };
  });
  if (userId && !isLoggedIn) {
    console.log("User is not logged in");
  }
  // const queryClient = useQueryClient();

  return (
    <>
      <Stack direction="column">
        <TextField
          sx={{ width: "100%", marginY: "1rem" }}
          label="Group Name"
          // error={groupNameError}
          // helperText={groupNameError ? "Group name is required" : ""}
          variant="outlined"
          // value={groupName}
          onChange={() => {}}
        />
        <Divider sx={{ my: "1rem" }} />
        <Typography variant="h5">Playlists</Typography>
        <Stack
          direction="row"
          sx={{
            width: "100%",
            justifyContent: "space-between",
            my: "1rem",
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center", ml: "2rem" }}>
            <Typography variant="h6">Songs Per User.</Typography>
            <Tooltip title="Minimum: 5, Maximum: 50.">
              <InfoIcon sx={{ height: 15, width: 15, ml: "0.5rem" }} />
            </Tooltip>
          </Stack>
          <TextField
            type="number"
            size="small"
            defaultValue={5}
            sx={{ width: "5rem" }}
          />
        </Stack>
      </Stack>
      <DialogActions sx={{ mt: "1rem" }}>
        <Button
          variant="outlined"
          sx={{
            width: { md: "6.5rem" },
            paddingLeft: "0rem",
            marginRight: "0.5rem",
            color: "#47a661",
            borderColor: "#47a661",
            textAlign: "center",
            padding: "0.5rem",
          }}
          onClick={props.toggleGroupSettingsModal}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
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
          onClick={() => {}}
        >
          Apply
        </Button>
      </DialogActions>
    </>
  );
};

export default GroupSettings;
