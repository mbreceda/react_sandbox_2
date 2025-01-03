import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "react-router-dom";
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

export const createContactAction = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const contact = {
    id: allContacts.length + 1,
    first: "",
    last: "",
    avatar: "",
    twitter: "",
    favorite: false,
    notes: "",
  };
  allContacts.push(contact);
  return redirect(`/contacts/${contact.id}/edit`);
};

export const editContactAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 4000));
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  const contactId = Number(params.contactId as string);
  const contact = allContacts.find((contact) => contact.id === contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  contact.first = updates.first as string;
  contact.last = updates.last as string;
  contact.avatar = updates.avatar as string;
  contact.twitter = updates.twitter as string;
  contact.favorite = (updates.favorite as string) === "on";
  contact.notes = updates.notes as string;

  allContacts[contactId - 1] = contact;

  return redirect(`/contacts/${contactId}`);
};
