import type { LoaderFunctionArgs } from "@remix-run/node";

import { db } from "~/utils/db.server";

function escapeCdata(s: string) {
  return s.replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const loglines = await db.logline.findMany({
    include: { author: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host");
  if (!host) {
    throw new Error("Could not determine domain URL.");
  }
  const protocol = host.includes("localhost")
    ? "http"
    : "https";
  const domain = `${protocol}://${host}`;
  const loglinesUrl = `${domain}/jokes`;

  const rssString = `
    <rss xmlns:blogChannel="${loglinesUrl}" version="2.0">
      <channel>
        <title>Loglines</title>
        <link>${loglinesUrl}</link>
        <description>Some funny loglines</description>
        <language>en-us</language>
        <generator>Kody the Koala</generator>
        <ttl>40</ttl>
        ${loglines
          .map((logline) =>
            `
            <item>
              <title><![CDATA[${escapeCdata(
                logline.name
              )}]]></title>
              <description><![CDATA[A funny logline called ${escapeHtml(
                logline.name
              )}]]></description>
              <author><![CDATA[${escapeCdata(
                logline.author.username
              )}]]></author>
              <pubDate>${logline.createdAt.toUTCString()}</pubDate>
              <link>${loglinesUrl}/${logline.id}</link>
              <guid>${loglinesUrl}/${logline.id}</guid>
            </item>
          `.trim()
          )
          .join("\n")}
      </channel>
    </rss>
  `.trim();

  return new Response(rssString, {
    headers: {
      "Cache-Control": `public, max-age=${
        60 * 10
      }, s-maxage=${60 * 60 * 24}`,
      "Content-Type": "application/xml",
      "Content-Length": String(
        Buffer.byteLength(rssString)
      ),
    },
  });
};