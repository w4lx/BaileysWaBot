import express from "express";

export function keepAlive() {
  const app = express();

  const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;

  app.get("/", (_, res) => res.send("Bot en funcionamiento."));

  app.listen(PORT, () => console.log("Ready!"));
}
