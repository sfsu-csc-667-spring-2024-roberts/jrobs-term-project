import express from "express";
import { Users } from "../../db/index.js";
import { encryptPassword } from "./password-handling.js";

const router = express.Router();

router.get("/register", (_request, response) => {
  response.render("auth/register");
});

router.post("/register", async (request, response) => {
  const { password, email } = request.body;

  if (await Users.exists(email)) {
    // The user email already exists in our database
    response.redirect("/auth/login");
  } else {
    const encryptedPassword = await encryptPassword(password);

    request.session.user = await Users.create(email, encryptedPassword);
    response.redirect("/lobby");
  }
});

router.get("/login", (request, response) => {
  response.render("auth/login");
});

router.post("/login", (request, response) => {
  response.redirect("/lobby");
});

router.get("/logout", (request, response, next) => {
  request.session.user = null;
  request.session.save((error) => {
    if (error) {
      next(error);
    }

    request.session.regenerate((error) => {
      if (error) {
        next(error);
      }
      response.redirect("/");
    });
  });
});

export default router;
