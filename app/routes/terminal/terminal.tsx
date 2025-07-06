import { TerminalErrorBoundary } from '~/routes/terminal/components/ErrorBoundary';
import { Terminal } from '~/routes/terminal/components/Terminal';

import type { Route } from './+types/terminal';

export function meta({}: Route.MetaArgs) {
  const title = 'Terminal Emulator - Interactive Web Terminal';
  const description =
    'A beautiful web-based terminal emulator with Unix-like commands, file system, and Catppuccin Mocha theme. Features command history, autocompletion, and text editing.';
  const keywords = 'terminal, emulator, web terminal, unix, commands, filesystem, catppuccin, react, typescript';
  const author = 'Terminal Emulator';

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
    { property: 'og:site_name', content: 'Terminal Emulator' },
    { property: 'og:locale', content: 'en_US' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:creator', content: '@terminal_emulator' },

    // Additional meta tags
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'English' },
    { name: 'revisit-after', content: '7 days' },
    { name: 'format-detection', content: 'telephone=no' },

    // PWA-related meta tags
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'Terminal' },

    // Security
    { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
    { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
    { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' },
  ];
}

export default function TerminalScreen() {
  return (
    <TerminalErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling logic
        console.error('Terminal route error:', error, errorInfo);

        // Could send to analytics or error reporting service
        // analytics.track('terminal_error', {
        //   error: error.message,
        //   stack: error.stack,
        //   componentStack: errorInfo.componentStack,
        // });
      }}
    >
      <Terminal />
    </TerminalErrorBoundary>
  );
}
