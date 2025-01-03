import { useCallback, useState } from "react"; // Adjust the import path as necessary
import { useLoaderData, Form, useNavigation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Search from "./components/Search";
import ContactList from "./components/ContactList";
import { ContactRecord } from "./pages/Contact";

function Root() {
  const navigate = useNavigation();
  const { allContacts } = useLoaderData() as {
    allContacts: ContactRecord[];
  };
  const [contacts, setContacts] = useState(allContacts);

  const handleSearch = useCallback(
    (text: string) => {
      const filteredContacts = allContacts.filter((contact) =>
        `${contact.first} ${contact}`
          .toLowerCase()
          .includes(text.toLowerCase()),
      );
      setContacts(filteredContacts);
    },
    [allContacts],
  );

  return (
    <div className="flex h-screen">
      <aside className="w-fit bg-gray-100 p-4">
        <div className="flex justify-between mb-4">
          <Search onChange={handleSearch} />
          <Form method="post">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2"
            >
              New
            </button>
          </Form>
        </div>
        <ContactList contacts={contacts} />
      </aside>
      <main className="flex-1 p-4 overflow-y-auto">
        {navigate.state === "loading" && (
          <div className="absolute inset-0 bg-gray-500 opacity-50 z-50 w-fill left-px"></div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default Root;
