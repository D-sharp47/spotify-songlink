import React, { useEffect } from "react";
import Welcome from "../components/Welcome";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../util/auth";
import { setCurrentUser } from "../store/authSlice";
import axios from "../util/axiosApi";
import { fetchTopSongs } from "../util/api";
import { useQuery } from "@tanstack/react-query";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { StoreType } from "../util/types";

const HomePage: React.FC = () => {
  const isLoggedIn = useSelector(
    (state: StoreType) => state.auth.isAuthenticated
  );
  const userID = useSelector((state: StoreType) => state.auth.user?._id);
  const [value, setValue] = React.useState(0);

  const { data: topSongs, isLoading: loadingTopSongs } = useQuery({
    queryKey: ["topSongs", userID],
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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const content = isLoggedIn ? (
    <>
      {loadingTopSongs ? (
        <Typography variant="h1" sx={{ color: "white" }}>
          Loading top songs...
        </Typography>
      ) : (
        <>
          <h2 style={{ color: "white" }}>Top Songs</h2>
          {topSongs && (
            <>
              <Box sx={{ width: "73%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    sx={{
                      "& .MuiTab-root": {
                        color: "#ffffff",
                      },
                      "& .MuiTab-root.Mui-selected": {
                        color: "#47a661",
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#47a661",
                      },
                    }}
                    aria-label="playlist-tabs"
                  >
                    {topSongs[0] && <Tab label="Short Term" />}
                    {topSongs[1] && <Tab label="Medium Term" />}
                    {topSongs[2] && <Tab label="Long Term" />}
                  </Tabs>
                </Box>
              </Box>
              <div
                style={{ position: "relative", width: "75%", height: "552px" }}
              >
                {topSongs.map((pid, index: number) => (
                  <iframe
                    key={pid}
                    style={{
                      borderRadius: "12px",
                      borderWidth: "0",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: value === index ? "block" : "none",
                    }}
                    src={`https://open.spotify.com/embed/playlist/${pid}?utm_source=generator&theme=0`}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="eager"
                  ></iframe>
                ))}
              </div>
            </>
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
