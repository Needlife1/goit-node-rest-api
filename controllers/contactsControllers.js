import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  changeContact,
} from "../services/contactsServices.js";

import {
  createContactSchema,
  updateContactSchema,
  updateFavoriteSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res) => {
  const allContacts = await listContacts();

  res.status(200).send(allContacts);
};

export const getOneContact = async (req, res) => {
  const { id } = req.params;

  const contactById = await getContactById(id);

  if (contactById === null) {
    return res.status(404).send({ message: "Not found" });
  }

  res.status(201).send(contactById);
};

export const deleteContact = async (req, res) => {
  const { id } = req.params;

  const deletedContact = await removeContact(id);

  if (deletedContact === null) {
    return res.status(404).send({ message: "Not found" });
  }

  res.status(200).send(deletedContact);
};

export const createContact = async (req, res) => {
  const contact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };

  const { value, error } = createContactSchema.validate(contact);

  if (typeof error !== "undefined") {
    return res.status(400).send({ message: error.message });
  }

  const newContact = await addContact(value);

  res.status(201).send(newContact);
};

export const updateContact = async (req, res) => {
  const contact = req.body;
  const { id } = req.params;

  const { value, error } = updateContactSchema.validate(contact);

  if (typeof error !== "undefined") {
    return res.status(400).send({ message: error.message });
  }

  const contactValue = Object.values(value);

  if (contactValue.length === 0) {
    return res
      .status(400)
      .send({ message: "Body must have at least one field" });
  }

  const updatedContact = await changeContact(value, id);

  if (updatedContact === null) {
    return res.status(404).send({ message: "Not found" });
  }

  res.status(200).send(updatedContact);
};

export const updateFavorite = async (req, res) => {
  const contact = req.body;
  const { id } = req.params;

  const { value, error } = updateFavoriteSchema.validate(contact);

  if (typeof error !== "undefined") {
    return res.status(400).send({ message: error.message });
  }

  const contactValue = Object.values(value);

  if (contactValue.length === 0) {
    return res
      .status(400)
      .send({ message: "Body must have at least one field" });
  }

  const updatedContact = await changeContact(value, id);

  if (updatedContact === null) {
    return res.status(404).send({ message: "Not found" });
  }

  res.status(200).send(updatedContact);
};
