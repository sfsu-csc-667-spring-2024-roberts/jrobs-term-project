import { Socket } from "socket.io-client";

import { GAME_REMOVED } from "../../backend/sockets/constants";

const gamesList = document.querySelector<HTMLElement>("#available-games-list");

export default function handle(socket: Socket) {
  socket.on(GAME_REMOVED, ({ gameId }: { gameId: number }) => {
    const gameElement = document.querySelector<HTMLElement>(`[data-game-id="${gameId}"]`);

    if (gamesList === null || gameElement === null) {
      console.error("Games list or game element not found");
      return;
    }

    gamesList.removeChild(gameElement);
  });
}
