import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

const { GRID_API_KEY } = process.env;

sgMail.setApiKey(GRID_API_KEY);

export const sendEmail = async (data) => {
  const email = { ...data, from: "vysotskymaxim124@gmail.com" };
  await sgMail.send(email);
  return true;
};
