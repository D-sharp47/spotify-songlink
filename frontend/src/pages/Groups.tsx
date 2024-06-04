import React, { Suspense } from "react";
// import { useSelector } from "react-redux";
import { useLoaderData, defer, Await } from "react-router-dom";
import { Button, Grid } from "@mui/material";
import axios from "axios";
import GroupCard, { GroupProps } from "../components/GroupCard";
import Modal from "../components/Modal";
import CreateGroup from "../components/CreateGroup";

const GroupsPage: React.FC = () => {
  // const userID = useSelector((state: any) => state.auth.user._id);
  const [showGroupModal, setShowGroupModal] = React.useState(false);
  const { groups } = useLoaderData() as { groups: GroupProps[] };

  const toggleGroupModal = () => {
    setShowGroupModal(!showGroupModal);
  };

  return (
    <>
      <Suspense
        fallback={
          <p style={{ textAlign: "center", color: "white" }}>
            Loading Groups...
          </p>
        }
      >
        <Await resolve={groups}>
          <Grid container spacing={2}>
            {groups.map((group: GroupProps) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={group._id}>
                <GroupCard
                  _id={group._id}
                  name={group.name}
                  members={group.members}
                  playlists={group.playlists}
                  settings={group.settings}
                />
              </Grid>
            ))}
          </Grid>
        </Await>
      </Suspense>
      <Button
        variant="contained"
        size="large"
        onClick={toggleGroupModal}
        sx={{
          my: "1rem",
          ml: "1rem",
          backgroundColor: "#47a661",
          "&:hover": {
            backgroundColor: "#367a4e", // Your custom color for hover state
          },
          color: "white",
        }}
      >
        Create Group
      </Button>
      <Modal
        title="Create Group"
        isOpen={showGroupModal}
        maxWidth="md"
        dismissDialog={toggleGroupModal}
        contents={<CreateGroup />}
        footerActions={
          <div style={{ margin: "1rem" }}>
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
              onClick={toggleGroupModal}
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
          </div>
        }
      />
    </>
  );
};

const loadGroups = async () => {
  const response = await axios.get(`/api/groups`);
  if (response.status < 300) {
    return response.data;
  }
  return [];
};

export const loader = async (authCheck: () => unknown) => {
  const auth: boolean = authCheck() === true;

  if (auth) {
    return defer({
      groups: await loadGroups(),
    });
  }
};

export default GroupsPage;
