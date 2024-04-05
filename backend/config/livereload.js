import connectLiveReload from "connect-livereload";
import livereload from "livereload";
import * as path from "path";

export default function liveReload(app, staticFilesPath) {
  if (process.env.NODE_ENV === "development") {
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(path.join(staticFilesPath, "dist"));
    liveReloadServer.server.once("connection", () => {
      setTimeout(() => {
        liveReloadServer.refresh("/");
      }, 100);
    });

    app.use(connectLiveReload());
  }
}
