// Importa las dependencias necesarias
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { readdir } from "fs/promises";

// Función asincrónica para establecer la conexión a WhatsApp
async function connectToWhatsApp() {
  // Obtiene el directorio actual del archivo
  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Obtiene el estado de la autenticación y la función para guardar las credenciales
  const { state, saveCreds } = await useMultiFileAuthState("BaileysWa");

  // Crea un socket de WhatsApp con la autenticación y opción para mostrar el código QR en la terminal
  const socket = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

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
connectToWhatsApp().catch((err) => console.error(err));

// Exporta la función para conectar a WhatsApp para su uso en otros módulos
export { connectToWhatsApp };
