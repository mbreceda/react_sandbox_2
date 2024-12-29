import { Link } from "react-router-dom";
import { ContactRecord } from "../pages/Contact";

export default function ContactList({
  contacts,
}: {
  contacts: ContactRecord[];
}) {
  return (
    <ul className="mb-4 mt-2 overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin">
      {contacts.map((contact) => (
        <li key={contact.id}>
          <Link
            to={`/contacts/${contact.id}`}
            className="p-2 border-b border-gray-200 block"
          >
            {contact.first} {contact.last}
          </Link>
        </li>
      ))}
    </ul>
  );
}
