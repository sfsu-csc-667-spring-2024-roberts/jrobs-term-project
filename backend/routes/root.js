import express from "express";

const router = express.Router();

router.get("/", (request, response) => {
  response.send("Hello world from within a route!");
});

export default router;
