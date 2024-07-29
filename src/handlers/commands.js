import { readdir } from "fs/promises";
import { resolve } from "path";

export default async function (socket) {
  const directory = await readdir(resolve("src", "commands"));

  for (const folder of directory) {
    const files = await readdir(resolve("src", "commands", folder));

    for (const file of files) {
      const command = await import(`../commands/${folder}/${file}`);
      socket.commands.set(command.default.name, command.default);
    }
  }
}
