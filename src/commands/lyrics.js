import { Client } from "genius-lyrics";

export default {
  name: "lyrics",
  alias: ["l", "letra"],

  run: async (socket, msg, args) => {
    try {
      const name = args.join(" ");

      if (!name) {
        socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Ingresa el nombre de una canción.",
        });
        return;
      }

      const songs = await new Client().songs.search(name);

      if (songs.length <= 0) {
        socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Sin resultados.",
        });
        return;
      }

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: `*${songs[0].title}*\n${await songs[0].lyrics()}`,
      });
    } catch (error) {
      console.error(error);

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "¡Ups! Sucedió un error",
      });
    }
  },
};
