import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, Link, isRouteErrorResponse, useActionData, useNavigation, useRouteError } from "@remix-run/react";
import LoglineDisplay from "~/components/logline";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUserId, requireUserId } from "~/utils/session.server";

function validateLoglineContent(content: string) {
  if (content.length < 10) {
    return "That logline is too short";
  }
}

function validateLoglineName(name: string) {
  if (name.length < 3) {
    return "That logline's name is too short";
  }
}

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const data = await request.formData();
  const name = data.get('name');
  const content = data.get('content');

  if (typeof name !== 'string' || typeof content !== 'string') {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const fieldErrors = {
    content: validateLoglineContent(content),
    name: validateLoglineName(name),
  };
  const fields = { content, name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const logline = await db.logline.create({ data: { ...fields, authorId: userId } })
  return redirect(`/loglines/${logline.id}`)
}

export default function NewLoglineRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  if (navigation.formData) {
    const content = navigation.formData.get("content");
    const name = navigation.formData.get("name");
    if (
      typeof content === "string" &&
      typeof name === "string" &&
      !validateLoglineContent(content) &&
      !validateLoglineName(name)
    ) {
      return (
          <LoglineDisplay
            canDelete={false}
            isOwner={true}
            logline={{ name, content }}
          />
        );
    }
  }

  return (
    <div>
      <p>Add your own awesome logline:</p>
      <Form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              defaultValue={actionData?.fields?.name}
              name="name"
              type="text"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.name
              )}
              aria-errormessage={
                actionData?.fieldErrors?.name
                  ? "name-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.content
              )}
              aria-errormessage={
                actionData?.fieldErrors?.content
                  ? "content-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
            >
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}