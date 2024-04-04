export default function (request, response, next) {
  response.locals.menuItems = [
    { name: "Lobby", url: "/lobby", current: request.path.includes("lobby") },
    {
      name: "Game",
      url: "/games/42",
      current: request.path.includes("games"),
    },
    { name: "Test", url: "/test", current: request.path.includes("test") },
  ];

  next();
}
