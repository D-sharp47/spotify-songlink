import { Outlet, useLoaderData } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import SongLinkBG from "../assets/SongLinkBG.png";
import BG_Faded from "../assets/BG_Faded.png";
import Header from "../components/Header";
import { getTokenDuration, setAuthToken } from "../util/auth";
import { setCurrentUser } from "../store/authSlice";

const RootLayout: React.FC = () => {
  const isLoggedIn = useSelector((state: any) => state.auth.isAuthenticated);
  const bgImage = isLoggedIn ? BG_Faded : SongLinkBG;
  const token = useLoaderData();
  const dispatch = useDispatch();
  useEffect(() => {
    if (!token) {
      return;
    }

    if (token === "EXPIRED") {
      setAuthToken();
      dispatch(setCurrentUser({}));
      return;
    }

    const tokenDuration = getTokenDuration();

    setTimeout(() => {}, tokenDuration); // 1 hour timer
  }, [token]);

  return (
    <>
      <Header />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Outlet />
      </div>
    </>
  );
};

export default RootLayout;
