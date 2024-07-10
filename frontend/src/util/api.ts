import axios from "../util/axiosApi";
import { AxiosError } from "axios";

export const getAllGroups = async () => {
  try {
    const response = await axios.get("/api/groups");
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
    const response = await axios.get(`/api/groups/detail/?groupId=${groupId}`);
    if (response.status < 300) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching group:", error);
  }
};

export const createGroup = async (name: string, members: string[], playlists: string[]) => {
  try {
      await axios.post("/api/groups/create", {
      name,
      members,
      playlists,
    });
  } catch (err) {
    console.log(err);
  }
};

export const deleteGroup = async (groupId: string) => {
  try {
    await axios.delete(`/api/groups/delete?groupId=${groupId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(axiosError.response?.data);
  }
};

export const getFriends = async () => {
  try {
    const response = await axios.get("/api/friends");
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
    await axios.post(`/api/friends/add?friendId${friendId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(axiosError.response?.data);
  }
};

export const acceptFriend = async (friendId: string) => {
  try {
    await axios.put(`/api/friends/accept?friendId${friendId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(axiosError.response?.data);
  }
};

export const deleteFriend = async (friendId: string) => {
  try {
    axios.delete(`/api/friends/remove?friendId=${friendId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(axiosError.response?.data);
  }
};

export const searchUsers = async (searchTerm: string) => {
  try {
    const response = await axios.get(`/api/users/search?searchTerm=${searchTerm}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const fetchSongsByTerm = async (userID: string, term: string) => {
  try {
    const response = await axios.get(`/api/users?userId=${userID}&term=${term}`);
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
       shortTermPlaylist = (await axios.post("api/users/createPlaylist", {name: "Temp Short Term", tracks: shortTerm})).data.playlistId;
    }
    if (mediumTerm.length > 0) {
       mediumTermPlaylist = (await axios.post("api/users/createPlaylist", {name: "Temp Medium Term", tracks: mediumTerm})).data.playlistId;
    }
    if (longTerm.length > 0) {
       longTermPlaylist = (await axios.post("api/users/createPlaylist", {name: "Temp Long Term", tracks: longTerm})).data.playlistId;
    }

    console.log("\nShort pid: ", shortTermPlaylist);
    console.log("Medium pid: ", mediumTermPlaylist);
    console.log("Long pid: ", longTermPlaylist);

    return [ shortTermPlaylist, mediumTermPlaylist, longTermPlaylist ];
  } catch (error) {
    console.error("Error fetching top songs:", error);
    return null;
  }
};