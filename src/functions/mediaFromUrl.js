"use strict";

import { URL } from "node:url";

/**
 *
 * @param { string } url
 * @returns { Promise<{ data: Buffer, mimetype: string | null, size: number }> }ad
 */
export async function mediaFromUrl(url) {
  if (!url) return;

  const pUrl = new URL(url);

  const reqOptions = Object.assign({
    headers: { accept: "image/* video/* text/* audio/*" },
  });

  const response = await fetch(pUrl, reqOptions);
  const size = parseInt(response.headers.get("Content-Length"));

  if (size > 99999966.82) return "limit exceeded";

  const arrayBuffer = await response.arrayBuffer();

  return {
    data: Buffer.from(arrayBuffer, "base64"),
    mimetype: response.headers.get("Content-Type"),
    size,
  };
}
