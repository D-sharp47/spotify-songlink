import React, { useEffect } from "react";
import Welcome from "../components/Welcome";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../util/auth";
import { setCurrentUser } from "../store/authSlice";
import axios from "axios";

const HomePage: React.FC = () => {
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

  // useEffect(() => {
  //   if (jwtToken) {
  //     setToken({ jwtToken, spotifyToken }, (user as { _id: string })._id);
  //     dispatch(setCurrentUser(user));
  //     navigate("/");
  //   }
  // }, [jwtToken]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLoggedIn = useSelector((state: any) => state.auth.isAuthenticated);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userID = useSelector((state: any) => state.auth.user._id);

  const loadShort = async () => {
    try {
      const response = await axios.get(`/api/users/${userID}/shortTerm`);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const content = isLoggedIn ? (
    <>
      <h1 style={{ color: "white" }}>Logged In!</h1>
      <button onClick={loadShort}>Load Short Term</button>
    </>
  ) : (
    <Welcome />
  );

  return <>{content}</>;
};

export default HomePage;
