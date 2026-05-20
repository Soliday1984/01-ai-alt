import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/settings/', '/auth/'],
      },
    ],
    sitemap: 'https://01-ai-alt.vercel.app/sitemap.xml',
  };
}
