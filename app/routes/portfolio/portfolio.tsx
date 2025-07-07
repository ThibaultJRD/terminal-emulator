import { TerminalErrorBoundary } from '~/routes/terminal/components/ErrorBoundary';
import { Terminal } from '~/routes/terminal/components/Terminal';

import type { Route } from './+types/portfolio';

export function meta({}: Route.MetaArgs) {
  const title = 'Thibault Jaillard - Interactive Portfolio';
  const description =
    'Senior Mobile Developer specializing in React Native, TypeScript, and blockchain development. Interactive terminal-based portfolio showcasing projects including Fruitz (acquired by Bumble) and BNC Banking App (4M+ users).';
  const keywords = 'Thibault Jaillard, portfolio, terminal, React Native, TypeScript, mobile developer, blockchain, Fruitz, BNC, Montreal developer';
  const author = 'Thibault Jaillard';

  return [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'author', content: author },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#1e1e2e' }, // Catppuccin Mocha base color

    // Open Graph / Facebook
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:site_name', content: 'Thibault Jaillard Portfolio' },
    { property: 'og:locale', content: 'en_US' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:creator', content: '@ThibaultJRD' },

    // Additional meta tags
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'English' },
    { name: 'revisit-after', content: '7 days' },
    { name: 'format-detection', content: 'telephone=no' },

    // PWA-related meta tags
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'Portfolio' },

    // Security
    { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
    { httpEquiv: 'X-Frame-Options', content: 'DENY' },
    { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
  ];
}

export default function PortfolioScreen() {
  return (
    <TerminalErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling logic
        console.error('Portfolio route error:', error, errorInfo);

        // Could send to analytics or error reporting service
        // analytics.track('portfolio_error', {
        //   error: error.message,
        //   stack: error.stack,
        //   componentStack: errorInfo.componentStack,
        // });
      }}
    >
      <Terminal mode="portfolio" />
    </TerminalErrorBoundary>
  );
}
