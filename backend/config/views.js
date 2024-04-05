import express from "express";

export default function views(app, viewsPath, staticFilesPath) {
  app.set("views", viewsPath);
  app.set("view engine", "ejs");
  app.use(express.static(staticFilesPath));
}
