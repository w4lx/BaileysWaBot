import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
} from "@whiskeysockets/baileys";
import { Collection } from "@discordjs/collection";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { readdir } from "node:fs/promises";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import pino from "pino";

// Node.js versión >= 20
process.loadEnvFile();

ffmpeg.setFfmpegPath(path);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function connectToWhatsApp() {
  const question = (txt) => new Promise((resolve) => rl.question(txt, resolve));

  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const socket = makeWASocket({
    auth: state,
    //version: [2, 3000, 1015901307],
    logger: pino({ level: "silent" }),
    browser: Browsers.appropriate("chrome"),
  });

  socket.commands = new Collection();

  if (!socket.authState.creds.registered) {
    const number = await question(`Escribe tú número de WhatsApp:`);
    const formatNumber = number.replace(/[\s+\-()]/g, "");
    const code = await socket.requestPairingCode(formatNumber);
    console.log(`Tu codigo de conexión es: ${code}`);
  }

  const directory = await readdir(resolve("src", "handlers"));

  for (const file of directory) {
    (await import(`./handlers/${file}`)).default(socket);
  }

  socket.ev.on("creds.update", saveCreds);
}

connectToWhatsApp();

export { connectToWhatsApp };

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
process.on("uncaughtExceptionMonitor", console.error);
