import { Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getGroup } from "../util/api";

const GroupDetailPage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = useSelector((state: any) => state.auth.user._id);

  const groupId = useParams().groupId || "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLoggedIn = useSelector((state: any) => state.auth.isAuthenticated);

  const { data: group, isLoading: loadingGroup } = useQuery({
    queryKey: ["groups", "groupDetail"],
    queryFn: () => getGroup(groupId),
    enabled: isLoggedIn && !!groupId,
    staleTime: 30 * 60 * 1000,
  });

  return loadingGroup ? (
    <p style={{ textAlign: "center", color: "white" }}>Loading Group...</p>
  ) : (
    <>
      <h1 style={{ color: "white" }}>Group Name: {group.name}</h1>
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
          )}{" "}
        </div>
      </Stack>
    </>
  );
};

export default GroupDetailPage;
