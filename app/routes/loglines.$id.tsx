import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useParams, useRouteError } from "@remix-run/react";

import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";
import LoglineDisplay from "~/components/logline";

export const meta: MetaFunction<typeof loader> = ({
  data,
}) => {
  const { description, title } = data
    ? {
        description: `Enjoy the "${data.logline.name}" content and much more`,
        title: `"${data.logline.name}" content`,
      }
    : { description: "No logline found", title: "No logline" };

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  const logline = await db.logline.findUnique({
    where: { id: params.id },
  });
  if (!logline) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
  }
  return json({ isOwner: userId === logline.authorId, logline });
};

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  if (form.get("_action") !== "delete") {
    throw new Response(
      `The action ${form.get("_action")} is not supported`,
      { status: 400 }
    );
  }
  const userId = await requireUserId(request);
  const logline = await db.logline.findUnique({
    where: { id: params.id },
  });
  if (!logline) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  if (logline.authorId !== userId) {
    throw new Response(
      "Pssh, nice try. That's not your logline",
      { status: 403 }
    );
  }
  await db.logline.delete({ where: { id: params.id } });
  return redirect("/loglines");
};

export default function LoglineRoute() {
  const { logline, isOwner } = useLoaderData<typeof loader>();

  return (
    <LoglineDisplay logline={logline} isOwner={isOwner} />
  );
}

export function ErrorBoundary() {
  const { id } = useParams();

  const error = useRouteError();
  console.error(error);

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