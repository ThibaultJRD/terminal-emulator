import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/terminal/terminal.tsx'),
  route('portfolio', 'routes/portfolio/portfolio.tsx'),
  route('sitemap.xml', 'routes/sitemap.tsx'),
  route('.well-known/*', 'routes/well-known.tsx'),
] satisfies RouteConfig;
