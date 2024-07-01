import axios, { AxiosError } from "axios";

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
    const shortTerm = await fetchSongsByTerm(userID, "shortTerm");
    const mediumTerm = await fetchSongsByTerm(userID, "mediumTerm");
    const longTerm = await fetchSongsByTerm(userID, "longTerm");
    return { shortTerm, mediumTerm, longTerm };
  } catch (error) {
    console.error("Error fetching top songs:", error);
    return { shortTerm: [], mediumTerm: [], longTerm: [] };
  }
};