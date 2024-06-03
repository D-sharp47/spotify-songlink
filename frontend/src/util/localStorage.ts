import { setAuthToken } from "./auth";

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    const parsedState = JSON.parse(serializedState);
    const jwtToken = localStorage.getItem("jwtToken");
    const userId = parsedState.auth.user._id;
    if (jwtToken && userId) {
      setAuthToken(jwtToken, userId);
    }
    return parsedState;
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch {
    // ignore write errors
  }
};