// Importando las bibliotecas necesarias
import fs from "fs";
import path from "path";
import yts from "yt-search";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";

export default {
  name: "play",
  description: "Descarga canciones de Youtube.",
  alias: ["reproduce", "p"],
  use: "!play 'nombre o url'",

  run: async (socket, msg, args) => {
    try {
      // Obtiene el nombre de la canción de los argumentos proporcionados
      const name = args.join(" ");

      // Verifica si se proporcionó un nombre de canción
      if (!name) {
        // Si no se proporciona un nombre, envía un mensaje de error
        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Ingresa el nombre de la canción.",
        });
      }

      // Crea una ruta para el archivo de audio en el directorio temporal del sistema
      const output = path.resolve("src", "temp", `SONG${Date.now()}.mp3`);

      // Envia un mensaje de espera al usuario
      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      // Realiza una búsqueda en YouTube para encontrar el video correspondiente a la canción
      const video = (await yts(name)).all.find((i) => i.type === "video");

      // Verifica si se encontró un video correspondiente a la búsqueda
      if (!video) {
        // Si no se encuentra un video, envía un mensaje de error
        await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Sin resultados.",
        });

        // Envia una reacción de error al usuario
        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });
      }

      // Verifica si la duración del video no supera los 20 minutos (1200 segundos)
      if (video.seconds > 1200) {
        // Si el video es demasiado largo, envía un mensaje de error
        await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "El vídeo no debe superar los 20 minutos.",
        });

        // Envia una reacción de error al usuario
        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });
      }

      const stream = ytdl(video.url, { filter: "audioonly" });

      ffmpeg(stream)
        .addOutputOption(
          "-metadata",
          `title=${video.title}}`,
          "-metadata",
          `artist=${video.author.name}`
        )
        .on("end", async () => {
          // Envía información del video al usuario (título, autor, duración y vistas)
          await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
            image: { url: video.image }, // URL de la imagen en miniatura del video
            caption: `*${video.title}*\n\n*Autor:* ${video.author.name}\n*Duración:* ${video.timestamp}\n*Vistas:* ${video.views}`, // Información del video formateada
          });

          await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
            audio: { url: output }, // Contenido del audio
            mimetype: "audio/mpeg", // Tipo de archivo
          });

          // Elimina el archivo de audio del directorio temporal después de enviarlo
          fs.promises.unlink(output);

          // Envia una reacción de éxito al usuario
          socket.sendMessage(msg.messages[0]?.key.remoteJid, {
            react: { text: "✅", key: msg.messages[0]?.key },
          });
        })
        .save(output);
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
