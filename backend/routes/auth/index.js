import express from "express";

const router = express.Router();

router.get("/register", (request, response) => {
  response.render("auth/register");
});

router.get("/login", (request, response) => {
  response.render("auth/login");
});

router.post("/login", (request, response) => {
  response.redirect("/lobby");
});

router.get("/logout", (request, response) => {
  response.redirect("/");
});

export default router;
