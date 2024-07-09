import React, { useEffect } from "react";
import Welcome from "../components/Welcome";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../util/auth"; // Adjusted import
import { setCurrentUser } from "../store/authSlice";
import axios from "../util/axiosApi";
import SongTable from "../components/SongTable";
import { fetchTopSongs } from "../util/api";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@mui/material";
import { StoreType } from "../util/types";

const HomePage: React.FC = () => {
  const isLoggedIn = useSelector(
    (state: StoreType) => state.auth.isAuthenticated
  );
  const userID = useSelector((state: StoreType) => state.auth.user?._id); // Adjusted selector for user ID

  const { data: topSongs, isLoading: loadingTopSongs } = useQuery({
    queryKey: ["topSongs", { userId: userID }],
    queryFn: () => fetchTopSongs(userID),
    enabled: isLoggedIn && !!userID,
    staleTime: 30 * 60 * 1000,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const userToken = params.get("userToken");

  let user: object | undefined,
    accessToken: string = "",
    refreshToken: string = "",
    expires_in: number = 0;

  if (userToken) {
    const decodedUserToken = JSON.parse(decodeURIComponent(userToken));
    user = decodedUserToken.user;
    accessToken = decodedUserToken.tokens.accessToken;
    refreshToken = decodedUserToken.tokens.refreshToken;
    expires_in = decodedUserToken.tokens.expires_in;
  }

  const dispatch = useDispatch();

  useEffect(() => {
    if (accessToken && user) {
      setToken(
        { accessToken, refreshToken, expires_in },
        (user as { _id: string })._id
      );
      dispatch(setCurrentUser(user));
      navigate("/");
    }
  }, [accessToken, user, refreshToken, expires_in, dispatch, navigate]);

  const loadShort = async () => {
    try {
      const response = await axios.get(
        `/api/users?userId=${userID}&term=shortTerm`
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const content = isLoggedIn ? (
    <>
      <h1 style={{ color: "white" }}>Logged In!</h1>
      {loadingTopSongs ? (
        <Typography variant="h1" sx={{ color: "white" }}>
          Loading top songs...
        </Typography>
      ) : (
        <>
          <h2 style={{ color: "white" }}>Top Songs</h2>
          {topSongs?.longTerm?.length === 50 && (
            <SongTable topSongs={topSongs} />
          )}
        </>
      )}
      <button onClick={loadShort}>Load Short Term</button>
    </>
  ) : (
    <Welcome />
  );

  return <>{content}</>;
};

export default HomePage;
