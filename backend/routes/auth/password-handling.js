import bcrypt from "bcrypt";
import { Users } from "../../db/index.js";

const SALT_ROUNDS = 10;

export async function encryptPassword(clearTextPassword) {
  return await bcrypt.hash(clearTextPassword, SALT_ROUNDS);
}

export async function checkPassword(email, password) {
  try {
    const user = await Users.find(email);

    return await bcrypt.compare(password, user.password);
  } catch (error) {
    return false;
  }
}
