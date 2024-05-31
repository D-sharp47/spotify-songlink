import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./pages/Root";
import ErrorPage from "./pages/Error";
import HomePage from "./pages/Home";
import FriendsPage from "./pages/Friends";
import { checkAuthLoader, tokenLoader } from "./util/auth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    loader: tokenLoader,
    children: [
      { index: true, element: <HomePage /> },
      { path: "friends", element: <FriendsPage />, loader: checkAuthLoader },
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
