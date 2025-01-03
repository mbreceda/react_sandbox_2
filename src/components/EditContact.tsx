import { Form, useLoaderData } from "react-router-dom";
import { ContactRecord } from "../pages/Contact";

export default function EditContact() {
  const { contact } = useLoaderData() as {
    contact: ContactRecord;
  };

  return (
    <Form method="post" id="contact-form">
      <div className="flex items-center mb-4">
        <label className="w-1/6" htmlFor="first">
          Name
        </label>
        <input
          id="first"
          name="first"
          type="text"
          defaultValue={contact.first}
          className="w-3/6 p-2 border"
        />
        <span className="mx-2"> </span>
        <input
          id="last"
          name="last"
          type="text"
          defaultValue={contact.last}
          className="w-3/6 p-2 border"
        />
      </div>
      <div className="flex items-center mb-4">
        <label className="w-1/6" htmlFor="avatar">
          Avatar
        </label>
        <input
          id="avatar"
          name="avatar"
          type="text"
          defaultValue={contact.avatar}
          className="w-full p-2 border"
        />
      </div>
      <div className="flex items-center mb-4">
        <label className="w-1/6" htmlFor="twitter">
          Twitter
        </label>
        <input
          id="twitter"
          name="twitter"
          type="text"
          defaultValue={contact.twitter}
          className="w-full p-2 border"
        />
      </div>
      <div className="flex items-center mb-4">
        <label className="w-1/6" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={contact.notes}
          className="w-full p-2 border"
        />
      </div>
      {/* <div className="flex items-center mb-4">
        <label className="w-1/6" htmlFor="favorite">
          Favorite
        </label>
        <input
          id="favorite"
          name="favorite"
          type="checkbox"
          defaultChecked={contact.favorite}
          className="w-4 h-4"
        />
      </div> */}
      <div className="flex mb-4">
        <span className="w-24"></span>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          Save
        </button>
        <button
          type="button"
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
    </Form>
  );
}
