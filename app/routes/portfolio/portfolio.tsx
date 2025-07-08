import { CanonicalLink, PersonStructuredData } from '~/components/SEO';
import { TerminalErrorBoundary } from '~/routes/terminal/components/ErrorBoundary';
import { Terminal } from '~/routes/terminal/components/Terminal';

import type { Route } from './+types/portfolio';

export function meta({}: Route.MetaArgs) {
  const title = 'Thibault Jaillard - Interactive Portfolio';
  const description =
    'Discover the interactive portfolio of Thibault Jaillard, Senior Mobile Developer from Montréal. 8+ years experience building React Native apps with millions of users. Fruitz app acquired by Bumble (5.6M+ downloads), BNC Banking app (4M+ monthly users), blockchain projects with Cosmos ecosystem. Expert in TypeScript, React, Node.js, and mobile development.';
  const keywords =
    'Thibault Jaillard, Senior Mobile Developer, React Native expert, TypeScript developer, mobile app development, Fruitz Bumble acquisition, BNC Banking app, blockchain developer, Cosmos SDK, Montreal developer, interactive portfolio, terminal portfolio, JavaScript developer, Node.js, Redux, mobile banking';
  const author = 'Thibault Jaillard';
  const canonicalUrl = 'https://terminal-emulator-nine.vercel.app/portfolio';
  const ogImageUrl = 'https://terminal-emulator-nine.vercel.app/og-portfolio.png';

  return [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'author', content: author },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#1e1e2e' },

    // Open Graph / Facebook
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:site_name', content: 'Thibault Jaillard Portfolio' },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:image', content: ogImageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'Thibault Jaillard - Senior Mobile Developer Portfolio' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:creator', content: '@ThibaultJRD' },
    { name: 'twitter:image', content: ogImageUrl },
    { name: 'twitter:image:alt', content: 'Thibault Jaillard - Senior Mobile Developer Portfolio' },

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
      <CanonicalLink url="https://terminal-emulator-nine.vercel.app/portfolio" />
      <PersonStructuredData
        name="Thibault Jaillard"
        jobTitle="Senior Mobile Developer"
        description="Discover the interactive portfolio of Thibault Jaillard, Senior Mobile Developer from Montréal. 8+ years experience building React Native apps with millions of users. Fruitz app acquired by Bumble (5.6M+ downloads), BNC Banking app (4M+ monthly users), blockchain projects with Cosmos ecosystem. Expert in TypeScript, React, Node.js, and mobile development."
        url="https://terminal-emulator-nine.vercel.app/portfolio"
        email="thibault.jaillard@gmail.com"
        address={{
          locality: 'Montréal',
          region: 'QC',
          country: 'CA',
        }}
        knowsAbout={['React Native', 'TypeScript', 'JavaScript', 'Mobile Development', 'Blockchain', 'React', 'Node.js']}
        alumniOf="EPITECH - European Institute of Technology"
        worksFor={{
          name: 'GO ROCK IT',
          description: 'Banking consultant for Banque Nationale du Canada',
        }}
        sameAs={['https://github.com/ThibaultJRD', 'https://linkedin.com/in/thibault-jaillard', 'https://thibault.iusevimbtw.com']}
      />
      <Terminal mode="portfolio" />
    </TerminalErrorBoundary>
  );
}
