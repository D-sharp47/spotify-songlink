import { Box, Stack, Tab, Tabs } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getGroup } from "../util/api";
import React, { useEffect, useState } from "react";
import { StoreType } from "../util/types";

const GroupDetailPage: React.FC = () => {
  const userId = useSelector((state: StoreType) => state.auth.user._id);
  const [playlistId, setPlaylistId] = useState(null);

  const groupId = useParams().groupId || "";
  const isLoggedIn = useSelector(
    (state: StoreType) => state.auth.isAuthenticated
  );

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
  }, [group]);

  const [value, setValue] = React.useState(0);

  const playlistsCreated = group?.playlists.filter(
    (p: { created: boolean }) => p.created === true
  ).length;

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue); // Update the selected tab index
    const selectedPlaylist = group.playlists ? group.playlists[newValue] : null;
    if (selectedPlaylist) {
      setPlaylistId(selectedPlaylist.playlistId); // Update the playlistId state
    }
  };

  return loadingGroup ? (
    <p style={{ textAlign: "center", color: "white" }}>Loading Group...</p>
  ) : (
    <>
      <h1 style={{ color: "white" }}>Group Name: {group.name}</h1>
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
          <div style={{ position: "relative", width: "50%", height: "47%" }}>
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
      <Stack direction="row" spacing="25vh">
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "white", marginBottom: 0 }}>Members:</h2>
          <ul style={{ marginTop: 0 }}>
            {group.members.map((member: { userId: string; status: string }) => (
              <li key={member.userId}>
                <p
                  style={{
                    color: member.userId === userId ? "#47a661" : "white",
                  }}
                >
                  {member.userId} - {member.status}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "white", marginBottom: 0 }}>Playlists:</h2>
          {group.playlists ? (
            <ul style={{ marginTop: 0 }}>
              {group.playlists.map(
                (playlist: {
                  playlistId: string | undefined;
                  name: string;
                }) => (
                  <li key={playlist.name}>
                    <p style={{ color: "white" }}>{playlist.name}</p>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p>No playlsts</p>
          )}
        </div>
      </Stack>
    </>
  );
};

export default GroupDetailPage;
