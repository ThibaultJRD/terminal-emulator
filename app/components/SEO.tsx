interface CanonicalLinkProps {
  url: string;
}

export function CanonicalLink({ url }: CanonicalLinkProps) {
  return <link rel="canonical" href={url} />;
}

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

// Structured Data pour WebApplication
interface WebApplicationDataProps {
  name: string;
  description: string;
  url: string;
  creator: {
    name: string;
    url: string;
  };
  features: string[];
}

export function WebApplicationStructuredData({ name, description, url, creator, features }: WebApplicationDataProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Person',
      name: creator.name,
      url: creator.url,
    },
    features,
  };

  return <StructuredData data={data} />;
}

// Structured Data pour Person
interface PersonDataProps {
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  email: string;
  address: {
    locality: string;
    region: string;
    country: string;
  };
  knowsAbout: string[];
  alumniOf: string;
  worksFor: {
    name: string;
    description: string;
  };
  sameAs: string[];
}

export function PersonStructuredData({ name, jobTitle, description, url, email, address, knowsAbout, alumniOf, worksFor, sameAs }: PersonDataProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle,
    description,
    url,
    email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: address.locality,
      addressRegion: address.region,
      addressCountry: address.country,
    },
    knowsAbout,
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: alumniOf,
    },
    worksFor: {
      '@type': 'Organization',
      name: worksFor.name,
      description: worksFor.description,
    },
    sameAs,
    hasOccupation: {
      '@type': 'Occupation',
      name: jobTitle,
      description: description,
      skills: knowsAbout.join(', '),
    },
  };

  return <StructuredData data={data} />;
}
