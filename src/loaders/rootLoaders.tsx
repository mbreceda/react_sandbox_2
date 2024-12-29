import { LoaderFunctionArgs } from "react-router-dom";
import { allContacts } from "../data/allContacts";

export const contactsLoader = async () => {
  new Promise((resolve) => setTimeout(resolve, 1000));
  return { allContacts };
};

export const contactLoader = async ({ params }: LoaderFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const contactId = params.contactId as string;
  const contact = allContacts.find(
    (contact) => contact.id === Number(contactId),
  );
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return { contact };
};
