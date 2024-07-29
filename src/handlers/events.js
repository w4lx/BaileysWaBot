import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

export default async function (socket) {
  const folder = await readdir(resolve("src", "events"));

  for (const file of folder) {
    const event = await import(`../events/${file}`);

    const listener = event.default.once ? "once" : "on";

    socket.ev[listener](event.default.name, (...args) => {
      event.default.load(...args, socket);
    });
  }
}
