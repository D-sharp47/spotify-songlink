import {
  Avatar,
  Box,
  Divider,
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
import { setToken } from "../util/auth";
import { StoreType } from "../util/types";
import { useQuery } from "@tanstack/react-query";
import { getImage } from "../util/api";

interface UserMenuProps {
  toggleSettingsModal: () => void;
}

const UserMenu: React.FC<UserMenuProps> = (props) => {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const { userId, displayName } = useSelector((state: StoreType) => ({
    userId: state.auth.user._json?.id,
    displayName: state.auth.user._json.display_name,
  }));

  const { data: imgUrl, isLoading: loadingImg } = useQuery({
    queryKey: ["image", userId],
    queryFn: () => getImage(userId),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    setToken(null);
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
        {!loadingImg && (
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={displayName} src={imgUrl}>
                {imgUrl ? "" : displayName.slice(0, 1).toUpperCase() ?? "?"}
              </Avatar>
            </IconButton>
          </Tooltip>
        )}
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
          <MenuItem onClick={() => props.toggleSettingsModal()}>
            <Typography textAlign="center">Settings</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Typography textAlign="center">Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
};

export default UserMenu;
