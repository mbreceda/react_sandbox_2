import { NavLink } from "react-router-dom";
import { ContactRecord } from "../pages/Contact";

export default function ContactList({
  contacts,
}: {
  contacts: ContactRecord[];
}) {
  return (
    <nav>
      {contacts.length ? (
        <ul className="mb-4 mt-2 overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <NavLink
                to={`/contacts/${contact.id}`}
                className={({ isActive, isPending }) =>
                  `p-2 border-b border-gray-200 block hover:bg-gray-100 hover:text-blue-500 ${
                    isActive ? "bg-blue-100" : ""
                  } ${isPending ? "opacity-50" : ""}`
                }
              >
                {contact.first || contact.last ? (
                  <span className="mr-2">
                    {contact.first} {contact.last}
                  </span>
                ) : (
                  <i>No Name</i>
                )}
                {contact.favorite ? "⭐️" : null}
              </NavLink>
            </li>
          ))}
        </ul>
      ) : (
        <p>No contacts found</p>
      )}
    </nav>
  );
}
