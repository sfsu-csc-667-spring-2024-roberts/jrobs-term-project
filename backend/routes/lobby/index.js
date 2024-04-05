import express from "express";

const router = express.Router();

router.get("/", (request, response) => {
  response.render("lobby/lobby");
});

export default router;
