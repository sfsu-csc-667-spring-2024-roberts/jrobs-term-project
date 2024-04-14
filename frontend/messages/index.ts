import { default as chatMessageHandler } from "./chat-message";
import { default as gameCreatedHandler } from "./game-created";
import { default as gameRemovedHandler } from "./game-removed";

export default [chatMessageHandler, gameRemovedHandler, gameCreatedHandler];
