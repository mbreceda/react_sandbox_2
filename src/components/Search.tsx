import { memo } from "react";

const Search = memo(function Search({
  onChange,
}: {
  onChange: (text: string) => void;
}) {
  return (
    <input
      type="text"
      className="search-input p-2 border rounded-md shadow-sm "
      onChange={(e) => onChange(e.target.value)}
      style={{ outline: "none" }}
    />
  );
});

export default Search;
