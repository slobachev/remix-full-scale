import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";

import stylesUrl from "~/styles/loglines.css";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const loglineListItems = await db.logline.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
      take: 5,
     })
  return json({
    loglineListItems, user
  });
};

export default function LoglinesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="loglines-layout">
      <header className="loglines-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix Loglines"
              aria-label="Remix Loglines"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">M🤪VIE LOGLINES</span>
            </Link>
          </h1>
           {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="loglines-main">
        <div className="container">
          <div className="loglines-list">
            <Link to=".">Get a random logline</Link>
            <p>Here are a few more loglines to check out:</p>
            <ul>
              {data.loglineListItems.map(({ id, name }) => (
                <li key={id}>
                  <Link to={id} prefetch="intent">{name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="loglines-outlet">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="loglines-footer">
        <div className="container">
          <Link reloadDocument to="/loglines.rss">
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}