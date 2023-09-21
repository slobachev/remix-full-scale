import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import stylesUrl from '~/styles/index.css'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl }
]

export default function IndexRoute() {
  return (
    <div className="container">
      <div className="content">
        <h1>
          Movie <span>Loglines</span>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="loglines">Read Loglines</Link>
            </li>
            <li>
              <Link reloadDocument to="/loglines.rss">
                RSS
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}