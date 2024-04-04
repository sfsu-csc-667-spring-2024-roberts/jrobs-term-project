import express from "express";
import createError from "http-errors";
import rootRoutes from "./routes/root.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/", rootRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use((_request, _response, next) => {
  return next(createError(404));
});
