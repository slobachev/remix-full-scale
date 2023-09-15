import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const logline = await db.logline.findUnique({
    where: { id: params.id },
  });
  if (!logline) {
    throw new Error("Logline not found");
  }
  return json({ logline });
};

export default function LoglineRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's your fantastic logline:</p>
      <p>{data.logline.content}</p>
      <Link to=".">"{data.logline.name}" Permalink</Link>
    </div>
  );
}