import express from "express";

const router = express.Router();

router.post("/room-id", async (request, response) => {
  const { referer } = request.headers;

  if (referer.includes("lobby")) {
    response.json({ roomId: 0 });
  } else {
    const idIndex = referer.lastIndexOf("/");
    const roomId = parseInt(referer.slice(idIndex + 1));

    response.json({ roomId });
  }
});

export default router;
