import ffmpeg from "fluent-ffmpeg";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";

export default {
  name: "sticker",
  description: "Genera stickers.",
  alias: ["pegatina", "s"],
  use: "!sticke 'imagen, video o gif'",

  run: async (socket, msg) => {
    const type = Object.keys(msg.messages[0].message)[0];

    if (type !== "imageMessage" && type !== "videoMessage") return;

    const output = resolve("src", "temp", `${Date.now()}.webp`);

    try {
      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const src = await downloadMediaMessage(msg.messages[0], "stream");

      if (!src) return;

      if (type === "imageMessage") {
        await new Promise((resolve) => {
          ffmpeg(src)
            .on("end", resolve)
            .addOutputOptions([
              "-vf",
              "scale='iw*min(300/iw,300/ih)':'ih*min(300/iw,300/ih)',format=rgba,pad=300:300:'(300-iw)/2':'(300-ih)/2':'#00000000',setsar=1",
              "-lossless",
              "1",
            ])
            .toFormat("webp")
            .save(output);
        });
      } else if (type === "videoMessage") {
        await new Promise((resolve) => {
          ffmpeg(src)
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
            .save(output);
        });
      }

      await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        sticker: { url: output },
      });

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error(error?.stack || error);

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    } finally {
      await unlink(output);
    }
  },
};
