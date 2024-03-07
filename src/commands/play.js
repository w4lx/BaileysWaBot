// Importando las bibliotecas necesarias
import fs from "fs";
import yts from "yt-search";
import path from "path";
import ytdl from "ytdl-core";
import nodeid3 from "node-id3";
import ffmpeg from "fluent-ffmpeg";
import axios from "axios";

export default {
  name: "play",
  description: "Descarga canciones de Youtube.",
  alias: ["reproduce", "p"],
  use: "!play 'nombre o url'",

  run: async (socket, msg, args) => {
    try {
      const name = args.join(" ");

      if (!name) {
        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Ingresa el nombre de la canción.",
        });
      }

      const output = path.resolve("src", "temp", `SONG${Date.now()}.mp3`);

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const video = (await yts(name)).all.find((i) => i.type === "video");

      if (!video) {
        await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Sin resultados.",
        });

        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });
      }

      if (video.seconds > 1200) {
        await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "El vídeo no debe superar los 20 minutos.",
        });

        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });
      }

      const stream = ytdl(video.url, { filter: "audioonly" });

      await new Promise((resolve) => {
        ffmpeg(stream).audioBitrate(64).on("end", resolve).save(output);
      });

      const { data } = await axios.get(video.image || video.thumbnail, {
        responseType: "arraybuffer",
      });

      const tags = {
        title: video.title,
        artist: video.author?.name,
        image: {
          imageBuffer: data,
        },
      };

      const success = nodeid3.update(tags, output);

      if (success) {
        await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          image: { url: video.image },
          caption: `*${video.title}*\n\n*Autor:* ${video.author.name}\n*Duración:* ${video.timestamp}\n*Vistas:* ${video.views}`,
        });

        await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          audio: { url: output }, // Contenido del audio
          mimetype: "audio/mpeg", // Tipo de archivo
        });

        // Envia una reacción de éxito al usuario
        socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "✅", key: msg.messages[0]?.key },
        });

        fs.promises.unlink(output);
      }
    } catch (error) {
      // Manejo de errores: imprime el error en la consola y envía un mensaje de error al usuario
      console.error(error);

      await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        text: "¡Ups! Sucedió un error.",
      });

      // Envia una reacción de error al usuario
      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
