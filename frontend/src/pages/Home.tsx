import React, { useEffect } from "react";
import Welcome from "../components/Welcome";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import setAuthToken from "../util/setAuthToken";
import { setCurrentUser } from "../store/authSlice";

const HomePage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userToken = params.get("userToken");

  let user: Object,
    jwtToken = "";
  if (userToken) {
    const decodedUserToken = JSON.parse(decodeURIComponent(userToken));
    user = decodedUserToken.user;
    jwtToken = decodedUserToken.jwtToken;
  }

  const dispatch = useDispatch();

  useEffect(() => {
    if (jwtToken) {
      localStorage.setItem("jwtToken", jwtToken);
      setAuthToken(jwtToken);
      dispatch(setCurrentUser(user));
    }
  }, [jwtToken]);

  const isLoggedIn = useSelector((state: any) => state.auth.isAuthenticated);
  const content = isLoggedIn ? (
    <h1 style={{ color: "white" }}>Logged In!</h1>
  ) : (
    <Welcome />
  );

  return <>{content}</>;
};

export default HomePage;
