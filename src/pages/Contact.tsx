import { Form, useLoaderData } from "react-router-dom";

export interface ContactRecord {
  id: number;
  first: string;
  last: string;
  avatar: string;
  twitter: string;
  notes: string;
  favorite: boolean;
}
export default function Contact() {
  const { contact } = useLoaderData() as { contact: ContactRecord };

  return (
    <div className="max-full rounded overflow-hidden p-4 bg-white flex flex-row justify-center">
      <div className="flex justify-center mr-6">
        <img
          className="rounded-3xl"
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>
      <div className="text-left">
        <div>
          <h1 className="font-bold flex text-3xl">
            {contact.first || contact.last ? (
              <span className="mr-2">
                {contact.first} {contact.last}
              </span>
            ) : (
              <i>No Name</i>
            )}
            <Favorite contact={contact} />
          </h1>
        </div>

        {contact.twitter ? (
          <p className="text-blue-500 mt-2">
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? (
          <p className="mt-4 text-gray-600">{contact.notes}</p>
        ) : null}

        <div className="mt-4 flex">
          <Form action="edit">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Edit
            </button>
          </Form>
          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record.",
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({ contact }: { contact: Pick<ContactRecord, "favorite"> }) {
  const favorite = contact.favorite;
  return (
    <Form method="post">
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
        className={favorite ? "text-yellow-500" : "text-gray-500"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </Form>
  );
}
