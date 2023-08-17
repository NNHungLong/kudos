import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./styles/app.css";
import radixUI from "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: radixUI },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Theme
          appearance="light"
          accentColor="brown"
          grayColor="slate"
          panelBackground="solid"
        >
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </Theme>
        <div
          id="modal"
          className="radix-themes"
          data-accent-color="brown"
          data-gray-color="slate"
          data-has-background="false"
          data-panel-background="solid"
          data-radius="medium"
          data-scaling="100%"
        />
      </body>
    </html>
  );
}
