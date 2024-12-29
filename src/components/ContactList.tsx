import { Link } from "react-router-dom";
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
              <Link
                to={`/contacts/${contact.id}`}
                className="p-2 border-b border-gray-200 block hover:bg-gray-100"
              >
                {contact.first || contact.last ? (
                  <span className="mr-2">
                    {contact.first} {contact.last}
                  </span>
                ) : (
                  <i>No Name</i>
                )}
                {contact.favorite ? "⭐️" : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No contacts found</p>
      )}
    </nav>
  );
}
