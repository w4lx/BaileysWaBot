// Importa las dependencias necesarias
import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
} from "@whiskeysockets/baileys";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { readdir } from "node:fs/promises";
import { keepAlive } from "./server.js";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import pino from "pino";

ffmpeg.setFfmpegPath(path);

// Interfaz de línea de comandos para la entrada/salida estándar
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para mantener el bot activo 24/7
keepAlive();

// Función asincrónica para establecer la conexión a WhatsApp
async function connectToWhatsApp() {
  // Función para hacer preguntas en la consola y retornar una promesa
  const question = (text) => {
    return new Promise((resolve) => rl.question(text, resolve));
  };

  // Obtiene el estado de la autenticación y la función para guardar las credenciales
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  // Crea un socket de WhatsApp con la autenticación y opción para mostrar el código QR en la terminal
  const socket = makeWASocket({
    logger: pino({ level: "silent" }),
    browser: Browsers.appropriate("chrome"),
    auth: state,
  });

  if (!socket.authState.creds.registered) {
    const number = await question(`Escribe tú número de WhatsApp:`);

    const formatNumber = number.replace(/[\s+-]/g, "");

    const code = await socket.requestPairingCode(formatNumber);

    console.log(`Tu codigo de conexión es: ${code}`);
  }

  // Lee y carga los manejadores de eventos desde el directorio "handlers"
  const directory = await readdir(resolve("src", "handlers"));

  // Importa y ejecuta los manejadores de eventos
  for (const file of directory) {
    (await import(`./handlers/${file}`)).default(socket);
  }

  // Registra un evento para guardar las credenciales cuando se actualizan
  socket.ev.on("creds.update", saveCreds);
}

// Invoca la función para conectar a WhatsApp y maneja cualquier error que ocurra
connectToWhatsApp();

// Exporta la función para conectar a WhatsApp para su uso en otros módulos
export { connectToWhatsApp };
