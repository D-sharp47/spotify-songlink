import { Box, IconButton, Stack, Tab, Tabs } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { NavLink, useParams } from "react-router-dom";
import { getGroup } from "../util/api";
import React, { useEffect, useState } from "react";
import { StoreType } from "../util/types";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import Modal from "../components/Modal";
import GroupSettings from "../components/GroupSettings";

export type GroupDetail = {
  _id: string;
  name: string;
  creatorId: string;
  members: { userId: string; status: string; _id: string }[];
  playlists?: {
    name?: string;
    created?: boolean;
    followers?: string[];
    _id?: string;
    contributions?: { userId: string; tracks: string[]; _id: string }[];
    playlistId?: string;
  }[];
  settings: { songsPerMember: number; enabled: boolean };
};

const GroupDetailPage: React.FC = () => {
  const [playlistId, setPlaylistId] = useState(null);

  const groupId = useParams().groupId || "";
  const { userId, isLoggedIn } = useSelector((state: StoreType) => {
    return {
      userId: state.auth.user._id,
      isLoggedIn: state.auth.isAuthenticated,
      iconImg: state.auth.user._json?.image,
      displayName: state.auth.user?._json.display_name,
    };
  });

  const [value, setValue] = React.useState(0);
  const [showGroupSettingsModal, setShowGroupSettingsModal] =
    React.useState(false);
  const [status, setStatus] = React.useState(undefined);

  const { data: group, isLoading: loadingGroup } = useQuery({
    queryKey: ["groups", "groupDetail", groupId],
    queryFn: () => getGroup(groupId),
    enabled: isLoggedIn && !!groupId,
    staleTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (group?.playlists.length > 0 && group?.playlists[0].created) {
      setPlaylistId(group.playlists[0].playlistId);
    }
    if (group?.members.length > 0) {
      setStatus(
        group.members.find(
          (member: { userId: string; status: string }) =>
            member.userId === userId
        ).status
      );
    }
  }, [group]);

  const playlistsCreated = group?.playlists.filter(
    (p: { created: boolean }) => p.created === true
  ).length;

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    const selectedPlaylist = group.playlists ? group.playlists[newValue] : null;
    if (selectedPlaylist) {
      setPlaylistId(selectedPlaylist.playlistId);
    }
  };

  return loadingGroup ? (
    <p style={{ textAlign: "center", color: "white" }}>Loading Group...</p>
  ) : (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Stack
          direction="row"
          sx={{
            width: "47%",
            position: "relative",
            justifyContent: "center",
            alignItems: "center",
            mb: "0.5rem",
          }}
        >
          <NavLink to="/groups">
            <ArrowBackIcon
              sx={{ color: "white", position: "absolute", left: 0 }}
            />
          </NavLink>
          <h1 style={{ color: "white", margin: "0 auto" }}>{group.name}</h1>
          {status === "admin" && (
            <IconButton
              onClick={() => setShowGroupSettingsModal(!showGroupSettingsModal)}
              sx={{ position: "absolute", right: 0 }}
            >
              <SettingsIcon sx={{ color: "white" }} />
            </IconButton>
          )}
        </Stack>

        {playlistsCreated > 0 && (
          <>
            {playlistsCreated > 1 && playlistId && (
              <Box sx={{ width: "48%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    sx={{
                      "& .MuiTab-root": {
                        color: "#ffffff",
                      },
                      "& .MuiTab-root.Mui-selected": {
                        color: "#47a661",
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#47a661",
                      },
                    }}
                    aria-label="playlist-tabs"
                  >
                    {group.playlists?.map(
                      (p: { playlistId: string; name: "string" }) => (
                        <Tab key={p.playlistId} label={p.name} />
                      )
                    )}
                  </Tabs>
                </Box>
              </Box>
            )}
            <div
              style={{
                position: "relative",
                width: "50%",
                height: "480px",
                maxHeight: "56%",
              }}
            >
              {group.playlists?.map(
                (p: { playlistId: string }, index: number) => (
                  <iframe
                    key={p.playlistId}
                    style={{
                      borderRadius: "12px",
                      borderWidth: "0",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: value === index ? "block" : "none",
                    }}
                    src={`https://open.spotify.com/embed/playlist/${p.playlistId}?utm_source=generator&theme=0`}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="eager"
                  ></iframe>
                )
              )}
            </div>
          </>
        )}
      </Box>
      {group && (
        <Modal
          title="Group Settings"
          isOpen={showGroupSettingsModal}
          maxWidth="md"
          dismissDialog={() =>
            setShowGroupSettingsModal(!showGroupSettingsModal)
          }
          contents={
            <GroupSettings
              toggleGroupSettingsModal={() =>
                setShowGroupSettingsModal(!showGroupSettingsModal)
              }
              group={group}
            />
          }
        />
      )}
    </>
  );
};

export default GroupDetailPage;
