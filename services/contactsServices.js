import { Contact } from "../schemas/contactsSchemas.js";

export async function listContacts() {
  const data = await Contact.find();
  return data;
}

export async function getContactById(contactId) {
  const contacts = await Contact.findById(contactId);
  return contacts || null;
}

export async function removeContact(contactId) {
  const contacts = await Contact.findByIdAndDelete(contactId);

  return contacts || null;
}

export async function addContact(contact) {
  const newContact = await Contact.create(contact);

  return newContact;
}

export async function changeContact(contactUpdates, contactId) {
  const result = await Contact.findByIdAndUpdate(contactId, contactUpdates, {
    new: true,
  });
  return result || null;
}
