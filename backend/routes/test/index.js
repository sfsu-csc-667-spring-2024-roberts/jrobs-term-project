import dayjs from "dayjs";
import express from "express";
import db from "../../db/connection.js";
const router = express.Router();

router.get("/", async (_request, response) => {
  try {
    // We don't use the response, so I don't capture it
    await db.any(`INSERT INTO test_table ("test_string") VALUES ($1)`, [
      `Hello on ${dayjs().format("MMM D, YYYY @ HH:mm:ss")}`,
    ]);

    const dbResponse = await db.any(`SELECT * FROM test_table`);
    // Send the results to the client, json encoded
    response.json(dbResponse);
  } catch (error) {
    console.error(error);
    response.json({ error });
  }
});

export default router;
