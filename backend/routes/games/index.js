import express from "express";
import { Games } from "../../db/index.js";

const router = express.Router();

router.post("/create", async (request, response) => {
  const { id: creatorId } = request.session.user;
  const { description } = request.body;

  try {
    const id = await Games.create(creatorId, description);
    response.redirect(`/games/${id}`);
  } catch (error) {
    // If we were nice we would provide the user with an error message
    response.redirect("/lobby");
  }
});

router.get("/:id", async (request, response) => {
  const { id } = request.params;
  const gameData = await Games.get(id);

  response.render("games/games", gameData);
});

router.post("/join/:id", async (request, response) => {
  const { id: gameId } = request.params;
  const { id: userId } = request.session.user;

  try {
    await Games.join(gameId, userId);

    response.redirect(`/games/${gameId}`);
  } catch (error) {
    console.log(error);
    response.redirect("/lobby");
  }
});

export default router;
