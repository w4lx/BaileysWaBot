// Importa las dependencias necesarias
import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
} from "@whiskeysockets/baileys";
import { Collection } from "@discordjs/collection";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { readdir } from "node:fs/promises";
import { keepAlive } from "./keepAlive.js";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import pino from "pino";

ffmpeg.setFfmpegPath(path);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

keepAlive();

async function connectToWhatsApp() {
  const question = (txt) => new Promise((resolve) => rl.question(txt, resolve));

  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const socket = makeWASocket({
    logger: pino({ level: "silent" }),
    browser: Browsers.appropriate("chrome"),
    auth: state,
    version: [2, 2413, 11],
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
