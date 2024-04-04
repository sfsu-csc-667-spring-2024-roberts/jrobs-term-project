import express from "express";

const router = express.Router();

router.get("/", (request, response) => {
  const name = "Jrob";

  response.render("root", { name });
});

export default router;
