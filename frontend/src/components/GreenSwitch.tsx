import { alpha, styled, Switch } from "@mui/material";

export default styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#47a661",
    "&:hover": {
      backgroundColor: alpha("#47a661", theme.palette.action.hoverOpacity),
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#47a661",
  },
  "& .MuiSwitch-switchBase.Mui-disabled": {
    color: alpha("#47a661", theme.palette.action.disabledOpacity),
  },
  "& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track": {
    backgroundColor: alpha("#47a661", theme.palette.action.disabledOpacity),
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#47a661",
  },
  "& .MuiSwitch-track": {
    backgroundColor: alpha("#47a661", theme.palette.action.disabledOpacity),
  },
  "& .MuiSwitch-switchBase.Mui-disabled .MuiSwitch-thumb": {
    backgroundColor: alpha("#47a661", theme.palette.action.disabledOpacity),
  },
  "& .MuiSwitch-switchBase.Mui-disabled .MuiSwitch-track": {
    backgroundColor: alpha("#47a661", theme.palette.action.disabledOpacity),
  },
}));
