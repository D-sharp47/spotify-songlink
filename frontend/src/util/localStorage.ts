import { setToken } from "./auth";

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    const parsedState = JSON.parse(serializedState);
    
    // Extract token and user ID
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const expires_in = Number(localStorage.getItem("expires_in"));
    const userId = parsedState.auth.user._id;

    if (accessToken && refreshToken && expires_in && userId) {
      // Set the authentication tokens and user ID
      setToken({ accessToken, refreshToken, expires_in }, userId);
    }

    return parsedState;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export const saveState = (state: unknown) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (err) {
    console.error("Error saving state:", err);
  }
};
