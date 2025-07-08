import { CanonicalLink, PersonStructuredData } from '~/components/SEO';
import { TerminalErrorBoundary } from '~/routes/terminal/components/ErrorBoundary';
import { Terminal } from '~/routes/terminal/components/Terminal';

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
      <title>Thibault Jaillard - Interactive Portfolio</title>
      <meta
        name="description"
        content="Discover the interactive portfolio of Thibault Jaillard, Senior Mobile Developer from Montréal. 8+ years experience building React Native apps with millions of users. Fruitz app acquired by Bumble (5.6M+ downloads), BNC Banking app (4M+ monthly users), blockchain projects with Cosmos ecosystem. Expert in TypeScript, React, Node.js, and mobile development."
      />
      <meta
        name="keywords"
        content="Thibault Jaillard, Senior Mobile Developer, React Native expert, TypeScript developer, mobile app development, Fruitz Bumble acquisition, BNC Banking app, blockchain developer, Cosmos SDK, Montreal developer, interactive portfolio, terminal portfolio, JavaScript developer, Node.js, Redux, mobile banking"
      />
      <meta name="author" content="Thibault Jaillard" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1e1e2e" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="Thibault Jaillard - Interactive Portfolio" />
      <meta
        property="og:description"
        content="Discover the interactive portfolio of Thibault Jaillard, Senior Mobile Developer from Montréal. 8+ years experience building React Native apps with millions of users. Fruitz app acquired by Bumble (5.6M+ downloads), BNC Banking app (4M+ monthly users), blockchain projects with Cosmos ecosystem. Expert in TypeScript, React, Node.js, and mobile development."
      />
      <meta property="og:site_name" content="Thibault Jaillard Portfolio" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content="https://terminal-emulator-nine.vercel.app/portfolio" />
      <meta property="og:image" content="https://terminal-emulator-nine.vercel.app/og-portfolio.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Thibault Jaillard - Senior Mobile Developer Portfolio" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Thibault Jaillard - Interactive Portfolio" />
      <meta
        name="twitter:description"
        content="Discover the interactive portfolio of Thibault Jaillard, Senior Mobile Developer from Montréal. 8+ years experience building React Native apps with millions of users. Fruitz app acquired by Bumble (5.6M+ downloads), BNC Banking app (4M+ monthly users), blockchain projects with Cosmos ecosystem. Expert in TypeScript, React, Node.js, and mobile development."
      />
      <meta name="twitter:creator" content="@ThibaultJRD" />
      <meta name="twitter:image" content="https://terminal-emulator-nine.vercel.app/og-portfolio.png" />
      <meta name="twitter:image:alt" content="Thibault Jaillard - Senior Mobile Developer Portfolio" />

      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="format-detection" content="telephone=no" />

      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Portfolio" />

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
