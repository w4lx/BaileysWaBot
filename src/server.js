import express from "express";

export function keepAlive() {
  const app = express();

  app.all("/", (req, res) => {
    res.send("Bot en funcionamiento. ");
  });

  app.listen(3000, () => {
    console.log("Ready!");
  });

  connectToServer();
}

function connectToServer() {
  keepAlive();
}
