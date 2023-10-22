import ytdl from "@distube/ytdl-core";
import yts from "yt-search";
import fs from "fs";
import { tmpdir } from "os";
import { join } from "path";

export default {
  name: "play",

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

      // Crea un nombre de archivo temporal con marca de tiempo
      const tempFile = join(tmpdir(), Date.now() + ".mp3");

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

      // Descarga el audio de la URL de YouTube y guarda en el archivo temporal
      await new Promise((resolve, reject) => {
        const res = ytdl(`https://youtu.be/${video.videoId}`, {
          filter: "audioonly",
          quality: "highestaudio",
        });

        // Crea un flujo de escritura para guardar el archivo de audio
        res.pipe(fs.createWriteStream(tempFile));

        // Maneja eventos de finalización y error del flujo de descarga
        res.on("end", () => resolve(true));
        res.on("error", () => reject);
      });

      // Lee el archivo temporal como datos binarios (Buffer)
      const data = await fs.promises.readFile(tempFile);

      // Envía el archivo de audio como un mensaje a través del socket de Discord
      await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        audio: Buffer.from(data, "base64"), // Convierte los datos binarios a base64
        mimetype: "audio/mp4",
      });

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });

      // Elimina el archivo temporal después de enviar el mensaje
      await fs.promises.unlink(tempFile);
    } catch (error) {
      console.error(error);

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        text: "¡Ups! Sucedió un error.",
      });
    }
  },
};
