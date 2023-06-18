import type { LinksFunction } from "@remix-run/node"; 
import { Links, LiveReload , Outlet} from "@remix-run/react";

import stylesheet from "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];





export default function App() {

  
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        />
        <title>Remix: So great, it's funny!</title>
        <Links/>
      </head>
      <body  className="bg bg-green-400">
        Hello world
        <LiveReload />
        <Outlet/>
      </body>
    </html>
  );
}
