import axios from "../util/axiosApi";
import { AxiosError } from "axios";
import { refreshToken } from "./auth";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "https://songlink.co";

export const getUserSettings = async (userId: string) => {
  try {
    const response = await axios.get(`${backendUrl}/api/users/preferences`, {
      params: {
        userId
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
};

export const updateUserSettings = async (userId: string, image: string | undefined, display_name: string, autoFollowPlaylistsOnCreate: boolean, autoUnfollowPlaylistsOnLeave: boolean) => {
  try {
    const response = await axios.put(`${backendUrl}/api/users/preferences`, {
      image,
      display_name,
      settings: {
        autoFollowPlaylistsOnCreate,
        autoUnfollowPlaylistsOnLeave
      }
    }, {
      params: {
        userId
      }
    });
    return response;
  } catch (error) {
    console.error("Error updating user settings:", error);
  }
};

export const getAllGroups = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/groups`);
    if (response.status < 300) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

export const getGroup = async (groupId: string) => {
  try {
    const response = await axios.get(`${backendUrl}/api/groups/detail/?groupId=${groupId}`);
    if (response.status < 300) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching group:", error);
  }
};

export const createGroup = async (name: string, members: string[], playlists: string[]) => {
  try {
      const response = await axios.post(`${backendUrl}/api/groups/create`, {
      name,
      members,
      playlists,
    });

    return response;
  } catch (err) {
    console.log(err);
  }
};

export const deleteGroup = async (groupId: string) => {
  try {
    await axios.delete(`${backendUrl}/api/groups/delete?groupId=${groupId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(axiosError.response?.data);
  }
};

export const getFriends = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/friends`);
    if (response.status < 300) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
};

export const addFriend = async (friendId: string) => {
  try {
    await axios.post(`${backendUrl}/api/friends/add?friendId=${friendId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(axiosError.response?.data);
  }
};

export const acceptFriend = async (friendId: string) => {
  try {
    await axios.put(`${backendUrl}/api/friends/accept?friendId=${friendId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(axiosError.response?.data);
  }
};

export const deleteFriend = async (friendId: string) => {
  try {
    axios.delete(`${backendUrl}/api/friends/remove?friendId=${friendId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(axiosError.response?.data);
  }
};

export const searchUsers = async (searchTerm: string) => {
  try {
    const response = await axios.get(`${backendUrl}/api/users/search?searchTerm=${searchTerm}`);
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const fetchSongsByTerm = async (userID: string, term: string) => {
  try {
    const response = await axios.get(`${backendUrl}/api/users?userId=${userID}&term=${term}`);
    if (response.status === 401) {
      await refreshToken();
      const newResponse = await axios.get(`${backendUrl}/api/users?userId=${userID}&term=${term}`);
      return newResponse.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
};

export const fetchTopSongs = async (userID: string) => {
  try {
    const shortTerm = await fetchSongsByTerm(userID, "short_term");
    const mediumTerm = await fetchSongsByTerm(userID, "medium_term");
    const longTerm = await fetchSongsByTerm(userID, "long_term");

    let shortTermPlaylist: string | null = null;
    let mediumTermPlaylist: string | null = null;
    let longTermPlaylist: string | null = null;

    if (shortTerm.length > 0) {
       shortTermPlaylist = (await axios.post(`${backendUrl}/api/users/createPlaylist`, {name: "Top Songs Short Term", tracks: shortTerm})).data.playlistId;
    }
    if (mediumTerm.length > 0) {
       mediumTermPlaylist = (await axios.post(`${backendUrl}/api/users/createPlaylist`, {name: "Top Songs Medium Term", tracks: mediumTerm})).data.playlistId;
    }
    if (longTerm.length > 0) {
       longTermPlaylist = (await axios.post(`${backendUrl}/api/users/createPlaylist`, {name: "Top Songs Long Term", tracks: longTerm})).data.playlistId;
    }

    return [ shortTermPlaylist, mediumTermPlaylist, longTermPlaylist ];
  } catch (error) {
    console.error("Error fetching top songs:", error);
    return null;
  }
};