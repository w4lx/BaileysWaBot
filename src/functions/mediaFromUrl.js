"use strict";

/**
 *
 * @param { string } url
 * @returns { Promise<{ data: Buffer, mimetype: string | null, size: number }> }ad
 */
export async function mediaFromUrl(url, limit = 1e8) {
  if (!url) return;

  try {
    const request = await fetch(url, {
      headers: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate",
        "User-Agent": process.env.USER_AGENT,
      },
    });

    if (!request.ok) return;

    const size = +request.headers.get("Content-Length");
    const mimetype = request.headers.get("Content-Type");

    if (size > limit) return "limit exceeded";

    const data = await request.arrayBuffer();

    return {
      data: Buffer.from(data, "base64"),
      mimetype,
      size,
    };
  } catch (error) {
    throw error.message || error;
  }
}
