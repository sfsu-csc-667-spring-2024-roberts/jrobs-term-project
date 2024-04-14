import express from "express";

import { CHAT_MESSAGE } from "../../sockets/constants.js";

const router = express.Router();

router.post("/:id", async (request, response) => {
  const { id: roomId } = request.params;
  const { message } = request.body;
  const { email: senderEmail, gravatar } = request.session.user;

  request.app
    .get("io")
    .emit(CHAT_MESSAGE, { roomId, message, senderEmail, gravatar, timestamp: new Date() });

  response.status(200).send();
});

export default router;
