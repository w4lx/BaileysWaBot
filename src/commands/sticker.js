import Ffmpeg from "fluent-ffmpeg";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { Readable } from "node:stream";
import { path } from "@ffmpeg-installer/ffmpeg";

export default {
  name: "sticker",
  alias: ["pegatina", "s"],

  // Función principal del comando
  run: async (socket, msg, args) => {
    if (!msg.messages[0].message) return;

    try {
      const type = Object.keys(msg.messages[0].message)[0];

      if (type !== "imageMessage" && type !== "videoMessage") return;

      Ffmpeg.setFfmpegPath(path);

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      // Descarga el mensaje multimedia recibido como datos binarios
      const data = await downloadMediaMessage(msg.messages[0], "buffer");

      if (!data) return;

      const tempFile = resolve("src", "temp", `${Date.now()}.webp`);

      const stream = new Readable();
      stream.push(data);
      stream.push(null);

      if (type === "imageMessage") {
        await new Promise((resolve, reject) => {
          Ffmpeg()
            .input(stream)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
              "-vf",
              "scale='iw*min(300/iw,300/ih)':'ih*min(300/iw,300/ih)',format=rgba,pad=300:300:'(300-iw)/2':'(300-ih)/2':'#00000000',setsar=1",
              "-lossless",
              "1",
            ])
            .toFormat("webp")
            .save(tempFile);
        });
      } else if (type === "videoMessage") {
        await new Promise((resolve, reject) => {
          Ffmpeg()
            .input(stream)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
              "-vcodec",
              "libwebp",
              "-vf",
              "scale='iw*min(300/iw,300/ih)':'ih*min(300/iw,300/ih)',format=rgba,pad=300:300:'(300-iw)/2':'(300-ih)/2':'#00000000',setsar=1,fps=10",
              "-loop",
              "0",
              "-ss",
              "00:00:00.0",
              "-t",
              "00:00:06.5",
              "-preset",
              "default",
              "-an",
              "-vsync",
              "0",
              "-s",
              "512:512",
            ])
            .toFormat("webp")
            .save(tempFile);
        });
      }

      // Envía el sticker como un mensaje a través del socket de WhatsApp
      await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        sticker: { url: tempFile },
      });

      // Editamos el mensaje de espera
      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });

      await unlink(tempFile);
    } catch (error) {
      console.error(error?.stack || error);

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
