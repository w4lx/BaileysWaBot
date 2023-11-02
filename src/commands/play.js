import yts from "yt-search";

export default {
  name: "play",
  alias: ["reproduce", "p"],
  cooldown: 10000,

  // Función principal del comando
  run: async (socket, msg, args) => {
    try {
      // Obtiene la URL proporcionada como argumento
      const name = args.join(" ");

      // Verifica si se proporciona el nombre del vídeo
      if (!name) {
        socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Ingresa el nombre de la canción.",
        });

        return;
      }

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const video = (await yts(name)).all.find((i) => i.type === "video");

      if (!video) {
        socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Sin resultados.",
        });

        return;
      }

      if (video.seconds > 1200) {
        socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "El vídeo no debe superar los 20 minutos.",
        });

        return;
      }

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        image: { url: video.image },
        caption: `*${video.title}*\n\n*Autor:* ${video.author.name}\n*Duración:* ${video.timestamp}\n*Vistas:* ${video.views}`,
      });

      await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        audio: { url: `https://aimtubemp3.onrender.com/vid/${video.videoId}` },
        mimetype: "audio/mp4",
      });

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error(error);

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        text: "¡Ups! Sucedió un error.",
      });
    }
  },
};
