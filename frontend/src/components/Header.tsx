import * as React from "react";
import { NavLink } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CustomIcon from "../assets/CustomIcon";
import { useSelector } from "react-redux";
import UserMenu from "./UserMenu";
import { Button } from "@mui/material";

const Header: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLoggedIn = useSelector((state: any) => state.auth.isAuthenticated);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky" sx={{ margin: 0, backgroundColor: "#47a661" }}>
        <Toolbar
          disableGutters
          sx={{ justifyContent: "space-between", marginX: "1rem" }}
        >
          <CustomIcon
            sx={{
              display: { xs: "none", md: "flex" },
              mr: 1,
              fontSize: "3em",
            }}
          />
          <NavLink
            to="/"
            style={{
              textDecoration: "none",
              color: "inherit",
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: "1.5rem",
              letterSpacing: ".3rem",
              marginRight: "1rem",
            }}
          >
            SongLink
          </NavLink>
          {isLoggedIn && (
            <>
              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                <NavLink to="/friends" style={{ textDecoration: "none" }}>
                  <Button
                    sx={{
                      my: 2,
                      color: "white",
                      display: "block",
                      "&:hover": {
                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
                      },
                    }}
                  >
                    Friends
                  </Button>
                </NavLink>
                <NavLink to="/groups" style={{ textDecoration: "none" }}>
                  <Button
                    sx={{
                      my: 2,
                      color: "white",
                      display: "block",
                      "&:hover": {
                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
                      },
                    }}
                  >
                    Groups
                  </Button>
                </NavLink>
              </Box>
              <UserMenu />
            </>
          )}
          {!isLoggedIn && (
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={() => {
                  window.location.href = "http://localhost:8000/api/auth";
                }}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Login
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default Header;
