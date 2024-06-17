import { Stack } from "@mui/material";
import axios from "axios";
import { Suspense } from "react";
import { useSelector } from "react-redux";
import { Await, defer, useLoaderData } from "react-router-dom";

type GroupType = {
  _id: string;
  name: string;
  members: {
    userId: string;
    status: "invited" | "member" | "admin";
  }[];
  playlists?: {
    playlistId?: string;
    name: string;
  }[];
  settings?: {
    songsPerMember: number;
    enabled: boolean;
  };
};

const GroupDetailPage: React.FC = () => {
  const { group } = useLoaderData() as { group: GroupType };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = useSelector((state: any) => state.auth.user._id);

  return (
    <Suspense
      fallback={
        <p style={{ textAlign: "center", color: "white" }}>Loading Group...</p>
      }
    >
      <Await resolve={group}>
        {(loadedGroup) => (
          <>
            <h1 style={{ color: "white" }}>Group Name: {loadedGroup.name}</h1>
            <Stack direction="row" spacing="25vh">
              <div style={{ textAlign: "center" }}>
                <h2 style={{ color: "white", marginBottom: 0 }}>Members:</h2>
                <ul style={{ marginTop: 0 }}>
                  {loadedGroup.members.map(
                    (member: { userId: string; status: string }) => (
                      <li key={member.userId}>
                        <p
                          style={{
                            color:
                              member.userId === userId ? "#47a661" : "white",
                          }}
                        >
                          {member.userId} - {member.status}
                        </p>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ color: "white", marginBottom: 0 }}>Playlists:</h2>
                {loadedGroup.playlists ? (
                  <ul style={{ marginTop: 0 }}>
                    {loadedGroup.playlists.map(
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
        )}
      </Await>
    </Suspense>
  );
};

const loadGroup = async (groupId: string) => {
  const response = await axios.get(`/api/groups/${groupId}`);
  if (response.status < 300) {
    return response.data;
  }
  throw new Error("Error fetching group");
};

export const loader = async (authCheck: () => unknown, groupId?: string) => {
  const auth: boolean = (await authCheck()) === true;

  if (!groupId) throw new Error("No group ID provided");

  if (auth) {
    return defer({
      group: await loadGroup(groupId),
    });
  }
};

export default GroupDetailPage;
