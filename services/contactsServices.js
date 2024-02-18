import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";

const contactsPath = join(process.cwd(), "db", "contacts.json");

export async function listContacts() {
  const data = await readFile(contactsPath);
  return JSON.parse(data);
}

export async function getContactById(contactId) {
  const contacts = await listContacts();
  return contacts.find((contact) => contact.id === contactId) || null;
}

export async function removeContact(contactId) {
  const contacts = await listContacts();
  const index = contacts.findIndex((contact) => contact.id === contactId);
  if (index === -1) {
    return null;
  }
  const [result] = contacts.splice(index, 1);
  await writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return result;
}

export async function addContact(contact) {
  const newContact = {
    id: nanoid(),
    ...contact,
  };

  const contacts = await listContacts();
  contacts.push(newContact);
  await writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return newContact;
}

export async function changeContact(contactUpdates, contactId) {
  const contacts = await listContacts();
  const index = contacts.findIndex((contact) => contact.id === contactId);
  if (index === -1) {
    return null;
  }

  const existingContact = contacts[index];
  const modifiedContact = { ...existingContact, ...contactUpdates };

  contacts[index] = modifiedContact;
  await writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return modifiedContact;
}
