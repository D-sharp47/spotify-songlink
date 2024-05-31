import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCurrentUser } from "../store/authSlice";
import { setAuthToken } from "../util/auth";

const UserMenu: React.FC = () => {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const iconImg = useSelector((state: any) => state.auth.user._json?.images[0]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    setAuthToken(null);
    dispatch(setCurrentUser({}));
    navigate("/");
  };

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          justifyContent: "flex-end",
          display: { md: "flex" },
        }}
      >
        <Tooltip title="Open settings">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar alt="Denali Sharp" src={iconImg?.url}>
              {iconImg ? "" : "D"}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: "45px" }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          <MenuItem onClick={handleLogout}>
            <Typography textAlign="center">Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
};

export default UserMenu;
