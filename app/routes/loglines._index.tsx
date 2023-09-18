import { json } from "@remix-run/node";
import { Link, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const loader = async () => {
  const count = await db.logline.count();
  const index = Math.floor(Math.random() * count);
  const [logline] = await db.logline.findMany({
    skip: index,
    take: 1
  })
  if (!logline) {
    throw new Response("No random logline found", {
      status: 404,
    });
  }
  return json({ logline });
};

export default function LoglinesIndexRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <p>Here's a random logline:</p>
      <p>
        {data.logline.content}
      </p>
      <Link to={data.logline.id}>
        "{data.logline.name}" Permalink
      </Link>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="error-container">
        <p>There are no loglines to display.</p>
        <Link to="new">Add your own</Link>
      </div>
    );
  }

  return (
    <div className="error-container">
      I did a whoopsies.
    </div>
  );
}