import { Socket } from "socket.io-client";

import { GAME_CREATED } from "../../backend/sockets/constants";

export default function handle(socket: Socket) {
  const gamesList = document.querySelector<HTMLElement>("#available-games-list");
  const availableGameTemplate = document.querySelector<HTMLTemplateElement>(
    "#available-game-template",
  );

  socket.on(
    GAME_CREATED,
    ({
      gameId,
      creatorEmail,
      creatorGravatar,
      description,
    }: {
      gameId: number;
      creatorEmail: string;
      creatorGravatar: string;
      description: string;
    }) => {
      if (gamesList === null || availableGameTemplate === null) {
        console.error("Games list or template not found");
        return;
      }

      const newGameElement = availableGameTemplate.content.cloneNode(true) as HTMLElement;
      const liElement = newGameElement.querySelector<HTMLElement>("li");
      console.log(liElement);
      liElement!.dataset.gameId = gameId.toString();

      const img = newGameElement.querySelector<HTMLImageElement>("img");
      img!.src = `https://gravatar.com/avatar/${creatorGravatar}`;
      img!.alt = `${creatorEmail.substring(0, creatorEmail.indexOf("@"))}'s gravatar`;

      const descriptionElement = newGameElement.querySelector<HTMLElement>(".game-description");
      descriptionElement!.textContent = description;

      const joinForm = newGameElement.querySelector<HTMLFormElement>("form");
      joinForm!.action = `/games/join/${gameId}`;

      gamesList.appendChild(newGameElement);
    },
  );
}
