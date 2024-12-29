import { useCallback, useState } from "react";
import Search from "./components/Search";
import ContactList from "./components/ContactList";
import { Outlet } from "react-router-dom";
import { allContacts } from "./data/allContacts";

function App() {
  const [contacts, setContacts] = useState(allContacts);

  const handleSearch = useCallback((text: string) => {
    const filteredContacts = allContacts.filter((contact) =>
      contact.first.toLowerCase().includes(text.toLowerCase()),
    );
    setContacts(filteredContacts);
  }, []);

  return (
    <div className="flex h-screen">
      <aside className="w-fit bg-gray-100 p-4">
        <Search onChange={handleSearch} />
        <ContactList contacts={contacts} />
      </aside>
      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
