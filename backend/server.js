import express from "express";
import createError from "http-errors";
import * as path from "path";
import rootRoutes from "./routes/root.js";

const PORT = process.env.PORT || 3000;
// Note that this path omits "backend" - server is running in the backend directory
// so BACKEND_PATH is PROJECT_ROOT/backend
const BACKEND_PATH = import.meta.dirname;
const STATIC_PATH = path.join(BACKEND_PATH, "static");
const VIEW_PATH = path.join(BACKEND_PATH, "views");

const app = express();

app.set("views", VIEW_PATH);
app.set("view engine", "ejs");
app.use(express.static(STATIC_PATH));

app.use("/", rootRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use((_request, _response, next) => {
  return next(createError(404));
});
