import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import Modal from "../components/Modal";
import CreateGroup from "../components/CreateGroup";
import { deleteGroup, getAllGroups } from "../util/api";
import { StoreType } from "../util/types";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import { AxiosError } from "axios";
import { NavLink } from "react-router-dom";

export interface GroupProps {
  readonly _id: string;
  readonly name: string;
  readonly members: object[];
  readonly playlists: object[];
  readonly settings: object;
}

const GroupsPage: React.FC = () => {
  const [showGroupModal, setShowGroupModal] = React.useState(false);
  const queryClient = useQueryClient();

  const isLoggedIn = useSelector(
    (state: StoreType) => state.auth.isAuthenticated
  );

  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ["groups", "allGroups"],
    queryFn: getAllGroups,
    enabled: isLoggedIn,
    staleTime: 30 * 60 * 1000,
  });

  const toggleGroupModal = () => {
    setShowGroupModal(!showGroupModal);
  };

  const handleDeleteClick = async (groupId: string) => {
    try {
      await deleteGroup(groupId);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError.response?.data);
    }
  };

  return (
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
        {loadingGroups ? (
          <p style={{ textAlign: "center", color: "white" }}>
            Loading Groups...
          </p>
        ) : (
          <>
            {groups?.length > 0 ? (
              <>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", mb: "1.rem", width: "50%" }}
                >
                  <Typography
                    sx={{ color: "#47a661", mr: "0.5rem", flex: "none" }}
                  >
                    Groups
                  </Typography>
                  <Diversity3Icon sx={{ color: "#47a661", mr: "1rem" }} />

                  <div style={{ flex: 1 }} />
                  <Button
                    variant="contained"
                    size="large"
                    onClick={toggleGroupModal}
                    sx={{
                      my: "1rem",
                      ml: "1rem",
                      backgroundColor: "#47a661",
                      "&:hover": {
                        backgroundColor: "#367a4e",
                      },
                      color: "white",
                    }}
                  >
                    Create Group
                  </Button>
                </Stack>

                <Card
                  sx={{
                    backgroundColor: "#2B2B2B",
                    width: "50%",
                    p: "0rem 1rem 1rem 1rem",
                    justifyContent: "center",
                    maxHeight: "728px",
                    overflowY: "auto",
                  }}
                >
                  {groups.map((group: GroupProps) => (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        mt: "1rem",
                      }}
                    >
                      <NavLink
                        to={`${group._id}`}
                        style={{ textDecoration: "none", flex: 1 }}
                      >
                        <Stack direction="row" spacing={2}>
                          <Stack direction="column" spacing={0}>
                            <Typography
                              variant="body1"
                              sx={{ color: "white", mr: "1rem" }}
                            >
                              {group.name}
                            </Typography>
                            <GroupMemberList
                              groupMembers={group.members as GroupMember[]}
                            />
                          </Stack>
                        </Stack>
                      </NavLink>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleDeleteClick(group._id)}
                        sx={{
                          backgroundColor: "#FF334B",
                          "&:hover": {
                            backgroundColor: "#CC2C3F",
                          },
                          color: "white",
                        }}
                      >
                        Leave
                      </Button>
                    </Box>
                  ))}
                </Card>
              </>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={toggleGroupModal}
                sx={{
                  my: "1rem",
                  ml: "1rem",
                  backgroundColor: "#47a661",
                  "&:hover": {
                    backgroundColor: "#367a4e",
                  },
                  color: "white",
                }}
              >
                Create Group
              </Button>
            )}
          </>
        )}
      </Box>
      <Modal
        title="Create Group"
        isOpen={showGroupModal}
        maxWidth="md"
        dismissDialog={toggleGroupModal}
        contents={<CreateGroup toggleGroupModal={toggleGroupModal} />}
      />
    </>
  );
};

export default GroupsPage;

type GroupMember = {
  userId: string;
  status: string;
};

const GroupMemberList = (props: { groupMembers: GroupMember[] }) => {
  const { groupMembers } = props;
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        flex: 1,
        ml: "1rem",
        textOverflow: "ellipsis",
      }}
    >
      {groupMembers.map((member: GroupMember, index: number) => (
        <Typography
          key={member.userId}
          variant="body2"
          sx={{
            color: "gray",
          }}
        >
          {member.userId} {groupMembers[index + 1] && ", "}
        </Typography>
      ))}
    </Stack>
  );
};
