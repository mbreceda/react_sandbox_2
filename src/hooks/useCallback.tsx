import { useState, memo, useCallback } from "react";

const allUsers = ["john", "alex ", "jane", "alice", "bob"];

const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

interface SearchProps {
  handleSearch: (text: string) => void;
}

const Search = memo(function Search({ handleSearch }: SearchProps) {
  console.log("Search component rendered");
  return (
    <input
      type="text"
      placeholder="Search"
      className="border rounded px-2 py-1"
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
});

export default function BasicUseCallback() {
  const [users, setUsers] = useState(allUsers);

  // Functions are different in every render by default
  // That's why Search component re-renders every time there is a change on the State
  //   const handleSearch = (text: string) => {
  //     const filteredUsers = allUsers.filter((user) =>
  //       user.toLowerCase().includes(text.toLowerCase())
  //     );
  //     setUsers(filteredUsers);
  //   };

  // We need to memorize the function to prevent re-renders
  const handleSearch = useCallback(
    (text: string) => {
      console.log(users[0]);

      const filteredUsers = allUsers.filter((user) =>
        user.toLowerCase().includes(text.toLowerCase()),
      );
      setUsers(filteredUsers);
    },
    // [] It freezes what the values are at the time of the function creation
    [users], // It will re-create the function every time the users change
  );

  return (
    <div className="p-4" style={{ height: "400px", overflowY: "auto" }}>
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setUsers(shuffle(allUsers))}
        >
          Shuffle
        </button>
        <Search handleSearch={handleSearch} />
      </div>
      <ul>
        {users.map((user) => (
          <li key={user} className="border rounded shadow p-2 mb-2">
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
}
