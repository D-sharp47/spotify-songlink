import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import SongLinkBG from "../assets/SongLinkBG.png";
import BG_Faded from "../assets/BG_Faded.png";
import Header from "../components/Header";

const RootLayout: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLoggedIn = useSelector((state: any) => state.auth.isAuthenticated);
  const bgImage = isLoggedIn ? BG_Faded : SongLinkBG;

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
