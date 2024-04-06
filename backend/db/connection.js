import pgp from "pg-promise";

const pgpInstance = pgp();
const connection = pgpInstance(process.env.DATABASE_URL);

export { pgpInstance as pgp };

export default connection;
