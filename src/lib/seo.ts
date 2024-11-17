export const defaultSEO = {
  title: 'Professional Tattoo Artist Portfolio',
  description: 'Explore unique tattoo designs and book your consultation. Specializing in custom tattoos and various styles.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    site_name: 'Your Tattoo Studio Name',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tattoo Portfolio',
      },
    ],
  },
  twitter: {
    handle: '@yourtwitterhandle',
    site: '@yourtwitterhandle',
    cardType: 'summary_large_image',
  },
};

export const getSEO = (options: Partial<typeof defaultSEO> = {}) => ({
  ...defaultSEO,
  ...options,
});
