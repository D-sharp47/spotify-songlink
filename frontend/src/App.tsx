import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { checkAuthLoader, tokenLoader } from "./util/auth";
import RootLayout from "./pages/Root";
import ErrorPage from "./pages/Error";
import HomePage from "./pages/Home";
import FriendsPage from "./pages/Friends";
import GroupPage from "./pages/Groups";
import GroupDetailPage from "./pages/GroupDetail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
        loader: checkAuthLoader,
      },
      {
        path: "groups",
        element: <GroupPage />,
        loader: checkAuthLoader,
      },
      {
        path: "groups/:groupId",
        element: <GroupDetailPage />,
        loader: checkAuthLoader,
      },
    ],
  },
]);

const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </div>
  );
};

export default App;
