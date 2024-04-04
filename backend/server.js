import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (request, response) => {
  response.send("Hello world!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
