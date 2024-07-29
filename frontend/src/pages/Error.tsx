import { useRouteError } from "react-router-dom";
import PageContent from "../components/PageContent";
import Header from "../components/Header";
import React from "react";

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
      </PageContent>
    </>
  );
};

export default ErrorPage;
