import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "react-router-dom";
import { allContacts } from "../data/allContacts";
import { ContactRecord } from "../pages/Contact";

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

export const createContactAction = async ({
  request,
}: ActionFunctionArgs): Promise<ContactRecord> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const formData = await request.formData();
  const contact = {
    id: allContacts.length + 1,
    first: formData.get("first") as string,
    last: formData.get("last") as string,
    avatar: formData.get("avatar") as string,
    twitter: formData.get("twitter") as string,
    favorite: formData.get("favorite") === "on",
    notes: "Loves cats",
  };
  allContacts.push(contact);
  return contact;
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
