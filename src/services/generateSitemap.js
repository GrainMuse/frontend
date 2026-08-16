import { SitemapStream, streamToPromise } from 'sitemap';
import fs from 'fs';

const sitemap = new SitemapStream({ hostname: 'https://grainmuse.net' });

const urls = [
    {
        url: 'https://grainmuse.net/',
        changefreq: 'weekly',
        priority: 1.0
    },
    {
        url: 'https://grainmuse.net/products',
        changefreq: 'weekly',
        priority: 0.9
    },
    {
        url: 'https://grainmuse.net/about',
        changefreq: 'yearly',
        priority: 0.8
    },
    {
        url: 'https://grainmuse.net/team',
        changefreq: 'monthly',
        priority: 0.8
    },
    {
        url: 'https://grainmuse.net/pathfinder-academy',
        changefreq: 'weekly',
        priority: 0.9
    },
    {
        url: 'https://grainmuse.net/contact',
        changefreq: 'monthly',
        priority: 0.9
    },
];

urls.forEach(url => sitemap.write(url));

sitemap.end();

streamToPromise(sitemap).then(data => {
  fs.writeFileSync('./public/sitemap.xml', data.toString());
});
