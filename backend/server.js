import connectLiveReload from "connect-livereload";
import cookieParser from "cookie-parser";
import "dotenv/config.js";
import express from "express";
import createError from "http-errors";
import livereload from "livereload";
import morgan from "morgan";
import * as path from "path";
import middlewareIsAuthenticated from "./middleware/is-authenticated.js";
import middlewareAuthenticatedMenuItems from "./middleware/menu-items-authenticated.js";
import middlewareDefaultMenuItems from "./middleware/menu-items-default.js";
import routesAuth from "./routes/auth/index.js";
import routesGames from "./routes/games/index.js";
import routesHome from "./routes/home/index.js";
import routesLobby from "./routes/lobby/lobby.js";
import routesTest from "./routes/test/index.js";

const PORT = process.env.PORT || 3000;
// Note that this path omits "backend" - server is running in the backend directory
// so BACKEND_PATH is PROJECT_ROOT/backend
const BACKEND_PATH = import.meta.dirname;
const STATIC_PATH = path.join(BACKEND_PATH, "static");
const VIEW_PATH = path.join(BACKEND_PATH, "routes");

const app = express();
app.use(middlewareDefaultMenuItems);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(STATIC_PATH, "dist"));
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });

  app.use(connectLiveReload());
}

app.set("views", VIEW_PATH);
app.set("view engine", "ejs");
app.use(express.static(STATIC_PATH));

app.use("/", routesHome);
app.use("/auth", routesAuth);

app.use(middlewareIsAuthenticated);
app.use(middlewareAuthenticatedMenuItems);
app.use("/lobby", routesLobby);
app.use("/games", routesGames);
app.use("/test", routesTest);

app.listen(PORT, () => {
  console.log(
    `Server started on port ${PORT}, in the ${process.env.NODE_ENV ?? "production"} environment`,
  );
});

app.use((_request, _response, next) => {
  return next(createError(404));
});
