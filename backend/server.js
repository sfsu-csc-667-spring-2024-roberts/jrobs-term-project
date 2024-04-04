import express from "express";
import createError from "http-errors";
import * as path from "path";
import rootRoutes from "./routes/root.js";

const __dirname = import.meta.dirname;
// Note that this path omits "backend" - server is running in the backend directory
// so __dirname is PROJECT_ROOT/backend
const STATIC_PATH = path.join(__dirname, "static");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(STATIC_PATH));

app.use("/", rootRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use((_request, _response, next) => {
  return next(createError(404));
});
