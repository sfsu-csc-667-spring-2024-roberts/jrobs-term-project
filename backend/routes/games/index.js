import express from "express";

const router = express.Router();

router.get("/:id", (request, response) => {
  const { id } = request.params;

  response.render("games/games", { id });
});

export default router;
