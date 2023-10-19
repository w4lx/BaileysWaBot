import { DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { connectToWhatsApp } from "../index.js";

export default {
  name: "connection.update",

  async load(update) {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect.error instanceof Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log(
        "Conexión cerrada debido a",
        lastDisconnect.error + ", reconectando...",
        shouldReconnect
      );

      if (shouldReconnect) {
        await connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  },
};
