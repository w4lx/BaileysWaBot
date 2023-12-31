// Importa las dependencias necesarias
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { createInterface } from "node:readline";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readdir } from "node:fs/promises";
import { keepAlive } from "./server.js";
import NodeCache from "node-cache";
import pino from "pino";

// Interfaz de línea de comandos para la entrada/salida estándar
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para hacer preguntas en la consola y retornar una promesa
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Función para mantener el bot activo 24/7
keepAlive();

// Función asincrónica para establecer la conexión a WhatsApp
async function connectToWhatsApp() {
  // Obtiene el directorio actual del archivo
  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Obtiene el estado de la autenticación y la función para guardar las credenciales
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  // Crea un socket de WhatsApp con la autenticación y opción para mostrar el código QR en la terminal
  const socket = makeWASocket({
    logger: pino({ level: "silent" }),
    mobile: false,
    browser: ["FireFox (linux)"],
    auth: state,
    msgRetryCounterCache: new NodeCache(),
  });

  if (!socket.authState.creds.registered) {
    const phoneNumber = await question(`Escribe tú número de WhatsApp:`);

    const code = await socket.requestPairingCode(phoneNumber);

    console.log(`Tu codigo de conexión es: ${code}`);

    console.log(
      `Abre tu WhatsApp, ve a Dispositivos vinculados >  vincular un dispositivo > vincular usando el numero de teléfono.`
    );
  }

  // Lee y carga los manejadores de eventos desde el directorio "handlers"
  const directory = await readdir(join(__dirname, "handlers"));

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
