import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { searchUsers } from "../util/api";

interface SearchUsersProps {
  label: string;
}

const SearchUsers = forwardRef((props: SearchUsersProps, ref) => {
  const label = props.label;
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Fetch user data from the API
    const fetchUsers = async () => {
      try {
        const response = await searchUsers(inputValue);
        setOptions(response?.data ?? []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    // Fetch users when inputValue changes
    if (inputValue) {
      fetchUsers();
    } else {
      setOptions([]);
    }
  }, [inputValue]);

  const getSelectedUser = () => inputValue;

  const clearInput = () => setInputValue("");

  // Expose functions to the parent component using useImperativeHandle
  useImperativeHandle(ref, () => ({
    getSelectedUser,
    clearInput,
  }));

  return (
    <Autocomplete
      id="user-autocomplete"
      sx={{
        borderRadius: "0.25rem",
        backgroundColor: "white",
        color: "black",
        width: "100%",
      }}
      options={options}
      getOptionLabel={(option) => option}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={inputValue}
      onChange={(_event, newValue) => setInputValue(newValue ?? "")}
      onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
});

export default SearchUsers;
