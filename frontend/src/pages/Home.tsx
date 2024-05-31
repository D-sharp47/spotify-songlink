import React, { useEffect } from "react";
import Welcome from "../components/Welcome";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setAuthToken } from "../util/auth";
import { setCurrentUser } from "../store/authSlice";

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
      setAuthToken(jwtToken, (user as { _id: string })._id);
      dispatch(setCurrentUser(user));
      navigate("/");
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
