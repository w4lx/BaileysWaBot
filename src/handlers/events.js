import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

// Esta función recibe un objeto socket como parámetro
export default async function (socket) {
  // Lee los archivos del directorio de eventos
  const folder = await readdir(resolve("src", "events"));

  // Itera sobre los archivos del directorio
  for (const file of folder) {
    // Importa el archivo de evento correspondiente
    const event = await import(`../events/${file}`);

    // Asigna la función del evento al evento correspondiente en el objeto socket.ev
    socket.ev.on(event.default.name, (...args) => {
      // Llama a la función del evento y pasa los argumentos junto con el objeto socket
      event.default.load(...args, socket);
    });
  }
}
