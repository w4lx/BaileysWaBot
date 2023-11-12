import { URL } from "url";

export async function mediaFromUrl(url) {
  if (!url) return;

  const pUrl = new URL(url);

  const reqOptions = Object.assign({
    headers: { accept: "image/* video/* text/* audio/*" },
  });

  const response = await fetch(pUrl, reqOptions);
  const arrayBuffer = await response.arrayBuffer();

  return {
    data: Buffer.from(arrayBuffer, "base64"),
    mimetype: response.headers.get("Content-Type"),
    size: arrayBuffer.byteLength,
  };
}
