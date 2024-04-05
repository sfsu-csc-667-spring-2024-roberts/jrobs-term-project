import db from "../connection.js";

const Sql = {
  INSERT:
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
  EXISTS: "SELECT id FROM users WHERE email=$1",
  // Note that this is ONLY for use in our backend (since it returns the password)
  FIND: "SELECT * FROM users WHERE email=$1 AND password=$2",
};

const create = async (email, password) => db.one(Sql.INSERT, [email, password]);
const exists = async (email) => {
  return null !== (await db.oneOrNone(Sql.EXISTS, [email]));
};
const find = async (email) => {
  const result = await db.oneOrNone(Sql.FIND, [email, password]);

  if (result === null) {
    throw "User with those credentials not found";
  } else {
    return result;
  }
};

export default {
  create,
  exists,
  find,
};
