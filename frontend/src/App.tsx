import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { checkAuthLoader, tokenLoader } from "./util/auth";
import RootLayout from "./pages/Root";
import ErrorPage from "./pages/Error";
import HomePage from "./pages/Home";
import FriendsPage, { loader as friendsLoader } from "./pages/Friends";
import GroupPage, { loader as groupLoader } from "./pages/Groups";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    loader: tokenLoader,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "friends",
        element: <FriendsPage />,
        loader: () => friendsLoader(checkAuthLoader),
      },
      {
        path: "groups",
        element: <GroupPage />,
        loader: () => groupLoader(checkAuthLoader),
      },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <RouterProvider router={router} />{" "}
    </div>
  );
};

export default App;
