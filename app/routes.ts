import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [index('routes/terminal/terminal.tsx'), route('portfolio', 'routes/portfolio/portfolio.tsx')] satisfies RouteConfig;
