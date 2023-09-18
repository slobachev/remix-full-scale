import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, isRouteErrorResponse, useLoaderData, useParams, useRouteError } from "@remix-run/react";

import { db } from "~/utils/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const logline = await db.logline.findUnique({
    where: { id: params.id },
  });
  if (!logline) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
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

export function ErrorBoundary() {
  const { id } = useParams();

  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="error-container">
        Huh? What the heck is "{id}"?
      </div>
    );
  }

  return (
    <div className="error-container">
      There was an error loading joke by the id "${id}".
      Sorry.
    </div>
  );
}