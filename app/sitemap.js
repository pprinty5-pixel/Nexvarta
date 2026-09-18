export default function sitemap() {
  const baseUrl = 'https://nexvarta.com';
  const categories = ['pune', 'maharashtra', 'india', 'tech', 'startup', 'politics', 'sports'];
  
  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/#${cat}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'hourly',
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#creatorHub`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    ...categoryUrls,
  ];
}
