import express from "express";
import { Games } from "../../db/index.js";

const router = express.Router();

router.get("/", async (_request, response) => {
  try {
    const availableGames = await Games.available();

    response.render("lobby/lobby", { availableGames });
  } catch (error) {
    console.error(error);
    response.render("lobby/lobby", { availableGames: [] });
  }
});

export default router;
