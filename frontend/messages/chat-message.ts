import { Socket } from "socket.io-client";
import { format, render } from "timeago.js";

import { CHAT_MESSAGE } from "../../backend/sockets/constants";

export type ChatMessage = {
  roomId: string;
  message: string;
  senderEmail: string;
  gravatar: string;
  timestamp: number;
};

const messageArea = document.querySelector<HTMLElement>("#chat-message-area");
const messageTemplate = document.querySelector<HTMLTemplateElement>("#chat-message-template");

export default function (socket: Socket) {
  socket.on(CHAT_MESSAGE, ({ roomId, message, senderEmail, gravatar, timestamp }: ChatMessage) => {
    if (messageTemplate === null || messageArea === null) {
      console.error("Chat functionality not configured on this page");
      return;
    }

    const messageElement = messageTemplate.content.cloneNode(true) as HTMLElement;

    const img = messageElement.querySelector<HTMLImageElement>("img");
    img!.src = `https://gravatar.com/avatar/${gravatar}`;
    img!.alt = `${senderEmail}'s gravatar`;

    const userName = messageElement.querySelector<HTMLElement>("span.chat-message-username");
    userName!.textContent = senderEmail.substring(0, senderEmail.indexOf("@"));

    const timestampElement = messageElement.querySelector<HTMLTimeElement>("time");
    timestampElement!.dateTime = timestamp.toString();
    render(timestampElement!);

    const content = messageElement.querySelector<HTMLElement>(".chat-message-body");
    content!.textContent = message;

    messageArea.insertBefore(messageElement, messageArea.firstChild);
    messageArea.scrollTop = messageArea.scrollHeight;
  });
}
