import {
  Button,
  Stack,
  DialogActions,
  Typography,
  Avatar,
  Box,
  TextField,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel,
  FormGroup,
  alpha,
  styled,
} from "@mui/material";
import { useSelector } from "react-redux";
import React, { useRef, useState } from "react";
import { StoreType } from "../util/types";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import { updateUserSettings } from "../util/api";

interface UserSettingsProps {
  toggleSettingsModal: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = (props) => {
  const { userId, isLoggedIn, iconImg, displayName } = useSelector(
    (state: StoreType) => {
      return {
        userId: state.auth.user._id,
        isLoggedIn: state.auth.isAuthenticated,
        iconImg: state.auth.user._json?.image,
        displayName: state.auth.user?._json.display_name,
      };
    }
  );
  if (userId && !isLoggedIn) {
    console.log("User is not logged in");
  }

  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    iconImg?.url || undefined
  );
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [editDisplayName, setEditDisplayName] = useState(false);
  const [autoFollow, setAutoFollow] = useState(false);
  const [autoUnfollow, setAutoUnfollow] = useState(false);

  const handleSave = () => {
    props.toggleSettingsModal();
    updateUserSettings(
      userId,
      selectedImage,
      newDisplayName,
      autoFollow,
      autoUnfollow
    );
  };

  return (
    <>
      <Divider sx={{ my: "1rem" }} />
      <Stack direction="column">
        <Typography variant="h5">Profile</Typography>
        <Stack direction="row" sx={{ margin: "1rem" }}>
          <AvatarWithHoverActions
            displayName={displayName}
            iconImg={iconImg}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />
          <Stack
            direction="column"
            sx={{ ml: "4rem", justifyContent: "center" }}
          >
            <Typography variant="h6">Display Name</Typography>
            <Stack direction="row" sx={{ alignItems: "center" }}>
              {editDisplayName ? (
                <form onSubmit={() => setEditDisplayName(false)}>
                  <TextField
                    variant="outlined"
                    size="small"
                    autoFocus
                    value={newDisplayName}
                    onBlur={() => setEditDisplayName(false)}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    onSubmit={() => setEditDisplayName(false)}
                    sx={{
                      width: "15rem",
                      color: "black",
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#C4C4C4",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#C4C4C4",
                        },
                      },
                    }}
                  ></TextField>
                </form>
              ) : (
                <>
                  <Typography variant="h4">{newDisplayName}</Typography>
                  <Button
                    sx={{ color: "black" }}
                    onClick={() => setEditDisplayName(true)}
                  >
                    <EditIcon />
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
        <Stack direction="row" sx={{ alignItems: "center", ml: "2rem" }}>
          <Typography variant="body2">
            Note: Updating Profile Picture and Display name will NOT make
            changes in Spotify.
          </Typography>
          <Tooltip title="Affects only your appearance in SongLink for yourself and friends.">
            <InfoIcon sx={{ height: 15, width: 15, ml: "0.5rem" }} />
          </Tooltip>
        </Stack>
        <Divider sx={{ my: "1rem" }} />
        <Typography variant="h5">Groups</Typography>
        <FormGroup>
          <Stack
            direction="row"
            sx={{ width: "100%", justifyContent: "space-between", my: "1rem" }}
          >
            <Stack direction="row" sx={{ alignItems: "center", ml: "2rem" }}>
              <Typography variant="h6">
                Auto follow playlists upon joining a group.
              </Typography>
              <Tooltip title="Will Add playlists to your Spotify Library.">
                <InfoIcon sx={{ height: 15, width: 15, ml: "0.5rem" }} />
              </Tooltip>
            </Stack>
            <FormControlLabel
              control={
                <GreenSwitch
                  checked={autoFollow}
                  onChange={() => setAutoFollow(!autoFollow)}
                />
              }
              label={autoFollow ? "On" : "Off"}
            />
          </Stack>
          <Stack
            direction="row"
            sx={{ width: "100%", justifyContent: "space-between" }}
          >
            <Stack direction="row" sx={{ alignItems: "center", ml: "2rem" }}>
              <Typography variant="h6">
                Auto unfollow playlists upon leaving a group.
              </Typography>
              <Tooltip title="Will Remove playlists from your Spotify Library.">
                <InfoIcon sx={{ height: 15, width: 15, ml: "0.5rem" }} />
              </Tooltip>
            </Stack>
            <FormControlLabel
              control={
                <GreenSwitch
                  checked={autoUnfollow}
                  onChange={() => setAutoUnfollow(!autoUnfollow)}
                />
              }
              label={autoUnfollow ? "On" : "Off"}
            />
          </Stack>
        </FormGroup>
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
          onClick={props.toggleSettingsModal}
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
          onClick={handleSave}
        >
          Apply
        </Button>
      </DialogActions>
    </>
  );
};

const GreenSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#47a661",
    "&:hover": {
      backgroundColor: alpha("#47a661", theme.palette.action.hoverOpacity),
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#47a661",
  },
}));

const AvatarWithHoverActions: React.FC<{
  displayName: string;
  iconImg: { url: string; height: number | null; width: number | null } | null;
  selectedImage?: string;
  setSelectedImage: (image?: string) => void;
}> = (props) => {
  const { displayName, iconImg, selectedImage, setSelectedImage } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChoosePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "180px",
        display: "inline-block",
        "&:hover .hoverActions": {
          display: "flex",
        },
      }}
    >
      <Avatar
        alt={displayName}
        src={selectedImage}
        sx={{ width: 180, height: 180, fontSize: 60 }}
      >
        {selectedImage ? "" : displayName.slice(0, 1).toUpperCase() ?? "?"}
      </Avatar>
      <Box
        className="hoverActions"
        sx={{
          display: "none",
          position: "absolute",
          top: 0,
          left: 0,
          width: "180px",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: "50%",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: "white",
          cursor: "pointer",
        }}
      >
        <Button
          sx={{
            mb: "0.5rem",
            color: "white",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
          onClick={handleChoosePhotoClick}
        >
          <Typography variant="body2">Choose photo</Typography>{" "}
          {!iconImg?.url && <EditIcon sx={{ ml: "0.25rem" }} />}
        </Button>
        {iconImg?.url && (
          <>
            <EditIcon sx={{ mb: "0.5rem", width: 30, height: 30 }} />
            <Button
              sx={{
                color: "white",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              onClick={() => {
                setSelectedImage(selectedImage ? undefined : iconImg.url);
              }}
            >
              <Typography variant="body2">
                {selectedImage ? "Remove photo" : "Revert changes"}
              </Typography>
            </Button>
          </>
        )}
      </Box>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg, image/png"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default UserSettings;
