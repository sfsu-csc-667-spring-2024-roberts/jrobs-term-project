export default function (request, response, next) {
  response.locals.menuItems = [
    { name: "Lobby", url: "/lobby", current: request.path.includes("lobby") },
    { name: "Test", url: "/test", current: request.path.includes("test") },
  ];

  next();
}
