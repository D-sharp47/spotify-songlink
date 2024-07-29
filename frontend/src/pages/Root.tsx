import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SongLinkBG from "../assets/SongLinkBG.png";
import BG_Faded from "../assets/BG_Faded.png";
import Header from "../components/Header";
import { useEffect } from "react";
import { setCurrentUser } from "../store/authSlice";
import { setToken } from "../util/auth";
import WebSocketInvalidator from "../util/WebSocketInvalidator";
import { StoreType } from "../util/types";
import axios from "../util/axiosApi";
import React from "react";
import Modal from "../components/Modal";
import UserSettings from "../components/UserSettings";

const RootLayout: React.FC = () => {
  const isLoggedIn = useSelector(
    (state: StoreType) => state.auth.isAuthenticated
  );
  const userId = useSelector((state: StoreType) => state.auth.user?._id);
  const bgImage = isLoggedIn ? BG_Faded : SongLinkBG;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showSettingsModal, setShowSettingsModal] = React.useState(false);

  const toggleSettingsModal = () => {
    setShowSettingsModal(!showSettingsModal);
  };

  useEffect(() => {
    if (isLoggedIn) {
      const accessToken = localStorage.getItem("accessToken");
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      axios.defaults.headers.common["userId"] = userId;
    }
    let logoutTimer: NodeJS.Timeout;
    const logoutTimeInMs = 1000 * 60 * 60 * 24; // 24hr
    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(logout, logoutTimeInMs);
    };

    const logout = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("expiration");
      setToken(null);
      dispatch(setCurrentUser({}));
      navigate("/");
    };

    const handleUserActivity = () => {
      resetTimer();
    };

    window.addEventListener("mousedown", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    resetTimer();

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousedown", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, []);

  return (
    <>
      <Header toggleSettingsModal={toggleSettingsModal} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)",
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {isLoggedIn && <WebSocketInvalidator />}
        <Outlet />
      </div>
      <Modal
        title="Settings"
        isOpen={showSettingsModal}
        isSettingsModal
        maxWidth="md"
        showCloseIcon
        dismissDialog={toggleSettingsModal}
        contents={<UserSettings toggleSettingsModal={toggleSettingsModal} />}
      />
    </>
  );
};

export default RootLayout;
