import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

// Esta función recibe un objeto socket como parámetro
export default async function (socket) {
  // Crea un conjunto para almacenar los comandos
  const commands = new Set();

  // Lee los archivos del directorio de comandos
  const folder = await readdir(resolve("src", "commands"));

  // Itera sobre los archivos del directorio
  for (const file of folder) {
    // Importa el archivo de comando correspondiente
    const cmd = await import(`../commands/${file}`);

    // Agrega el comando al conjunto de comandos
    commands.add(cmd.default);
  }

  // Almacena los comandos en el objeto socket para que estén disponibles en otros lugares del programa
  socket.commands = Array.from(commands);
}
