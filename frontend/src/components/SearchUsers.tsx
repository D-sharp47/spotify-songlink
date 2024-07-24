import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { searchUsers } from "../util/api";

interface SearchUsersProps {
  label: string;
  textFieldSize?: "small" | "medium";
}

const SearchUsers = forwardRef((props: SearchUsersProps, ref) => {
  const { label, textFieldSize } = props;
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
        backgroundColor: "#2B2B2B",
        color: "#47a661",
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
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size={textFieldSize}
          label={label}
          sx={{
            width: "100%",
            color: "#47a661",
            borderRadius: "0.25rem",
            backgroundColor: "#2B2B2B",
            "& label": {
              color: "#47a661",
            },
            "& label.Mui-focused": {
              color: "#47a661",
            },
            "& .MuiOutlinedInput-root": {
              // "& fieldset": {
              //   borderColor: "#47a661",
              // },
              "&:hover fieldset": {
                borderColor: "#47a661",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#47a661",
              },
            },
          }}
        />
      )}
    />
  );
});

export default SearchUsers;
