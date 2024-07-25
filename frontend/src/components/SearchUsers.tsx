import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { searchUsers } from "../util/api";
import { Paper } from "@mui/material";

interface SearchUsersProps {
  label: string;
  textFieldSize?: "small" | "medium";
}

const SearchUsers = forwardRef((props: SearchUsersProps, ref) => {
  const { label, textFieldSize } = props;
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);

  const fetchUsers = useCallback(async (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }

    try {
      const response = await searchUsers(query);
      setOptions(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(inputValue);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, fetchUsers]);

  const getSelectedUser = () => inputValue;

  const clearInput = () => setInputValue("");

  useImperativeHandle(ref, () => ({
    getSelectedUser,
    clearInput,
  }));

  const CustomPaper = (props: React.ComponentProps<typeof Paper>) => (
    <Paper
      {...props}
      sx={{
        backgroundColor: "#2B2B2B",
        color: "#47a661",
        border: "1px solid #47a661",
      }}
    />
  );

  const CustomListbox = (props: React.HTMLAttributes<HTMLElement>) => (
    <ul {...props} style={{ backgroundColor: "#2B2B2B", color: "#47a661" }} />
  );

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
      PaperComponent={CustomPaper}
      ListboxComponent={CustomListbox}
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
            input: { color: "#47a661" },
            borderRadius: "0.25rem",
            backgroundColor: "#2B2B2B",
            "& label": {
              color: "#47a661",
            },
            "& label.Mui-focused": {
              color: "#47a661",
            },

            "& .MuiOutlinedInput-root": {
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
