import express from "express";

import { Games } from "../../db/index.js";

const router = express.Router();

router.get("/", async (request, response) => {
  const { id: userId } = request.session.user;

  try {
    const availableGames = await Games.available(userId);

    response.render("lobby/lobby", { availableGames });
  } catch (error) {
    console.error(error);
    response.render("lobby/lobby", { availableGames: [] });
  }
});

export default router;
