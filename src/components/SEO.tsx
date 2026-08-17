import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
}

export default function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | PDF AI`;
    document.title = fullTitle;

    const updateMeta = (nameOrProperty: string, value: string, content: string) => {
      let element = document.querySelector(`meta[${nameOrProperty}="${value}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameOrProperty, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('name', 'description', description);
    updateMeta('property', 'og:title', fullTitle);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:url', window.location.href);
    updateMeta('name', 'twitter:title', fullTitle);
    updateMeta('name', 'twitter:description', description);
  }, [title, description]);

  return null;
}
