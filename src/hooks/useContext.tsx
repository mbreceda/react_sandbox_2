import { useState, createContext, useContext } from "react";

// USER INTERFACE
interface User {
  isSubscribed: boolean;
  name: string;
}

// CONTEXT
const DashboardContext = createContext<User | undefined>(undefined);

function useUserContext() {
  const user = useContext(DashboardContext);
  if (!user) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return user;
}

// SIDEBAR COMPONENT
function Sidebar() {
  const user = useUserContext();
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Sidebar</h2>
      <p className="text-gray-700">Name: {user.name}</p>
      <p className="text-gray-700">
        Subscribed: {user.isSubscribed ? "Yes" : "No"}
      </p>
    </div>
  );
}

// PROFILE COMPONENT
function Profile() {
  const user = useUserContext();
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Profile</h2>
      <p className="text-gray-700 font-medium">{user.name}</p>
    </div>
  );
}

// DASHBOARD COMPONENT
function Dashboad() {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-lg">
      <Sidebar />
      <Profile />
    </div>
  );
}

// MAIN COMPONENT
export default function BasicUseContext() {
  const [user] = useState<User>({ isSubscribed: true, name: "John" });

  return (
    <div>
      <DashboardContext.Provider value={user}>
        <Dashboad />
      </DashboardContext.Provider>
    </div>
  );
}
