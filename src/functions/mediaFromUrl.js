"use strict";

import { URL } from "node:url";

/**
 *
 * @param { string } url
 * @returns { Promise<{ data: Buffer, mimetype: string | null, size: number }> }ad
 */
export async function mediaFromUrl(source) {
  try {
    if (!source) return;

    const url = new URL(source);

    const request = await fetch(url, {
      headers: { accept: "image/* video/* audio/*" },
    });

    const size = parseInt(request.headers.get("Content-Length"));
    const mimetype = request.headers.get("Content-Type");

    if (size > 99999966.82) return "limit exceeded";

    const data = await request.arrayBuffer();

    return {
      data: Buffer.from(data, "base64"),
      mimetype,
      size,
    };
  } catch (error) {
    throw error?.message;
  }
}
