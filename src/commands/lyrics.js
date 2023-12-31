import { Client } from "genius-lyrics";

export default {
  name: "lyrics",
  description: "Obtén la letra de las canciones.",
  alias: ["l", "letra"],
  use: "!lyrics 'nombre'",

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

      if (!songs.length) {
        socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Sin resultados.",
        });

        return;
      }

      const lyrics = await songs[0].lyrics();

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: `*${songs[0].title}*\n${lyrics}`,
      });
    } catch (error) {
      console.error(error);

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "¡Ups! Sucedió un error",
      });
    }
  },
};
