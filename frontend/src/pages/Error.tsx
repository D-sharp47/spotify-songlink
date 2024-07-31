import { NavLink, useRouteError } from "react-router-dom";
import PageContent from "../components/PageContent";
import Header from "../components/Header";
import React from "react";
import { Button } from "@mui/material";

interface Error {
  status: number;
  data: {
    message: string;
  };
}

const ErrorPage: React.FC = () => {
  const error = useRouteError() as Error;

  let title: string = " An error occurred!";
  let message: string = "Something went wrong!";

  if (error.status === 500) {
    message = error.data.message;
  }

  if (error.status === 404) {
    title = "Not found!";
    message = "Could not find resource or page.";
  }

  console.log(error.status);

  const [showSettingsModal, setShowSettingsModal] = React.useState(false);

  const toggleSettingsModal = () => {
    setShowSettingsModal(!showSettingsModal);
  };

  return (
    <>
      <Header toggleSettingsModal={toggleSettingsModal} />
      <PageContent title={title}>
        <p>{message}</p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <NavLink to="/">
            <Button
              variant="contained"
              size="large"
              sx={{
                marginTop: 2,
                backgroundColor: "#47a661",
                "&:hover": {
                  backgroundColor: "#367a4e",
                },
              }}
            >
              Return to Homepage
            </Button>
          </NavLink>
        </div>
      </PageContent>
    </>
  );
};

export default ErrorPage;
