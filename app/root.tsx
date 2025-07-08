import { Analytics } from '@vercel/analytics/remix';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from 'react-router';

import type { Route } from './+types/root';
import './app.css';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'preload',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    as: 'style',
    onLoad: "this.onload=null;this.rel='stylesheet'",
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    media: 'print',
    onLoad: "this.media='all'",
  },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
  { rel: 'apple-touch-icon', href: '/favicon.svg' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <div className="bg-ctp-base flex h-screen w-screen items-center justify-center">
      <div className="text-ctp-text font-mono text-lg">
        <span className="animate-pulse">_</span>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
