import * as cheerio from 'cheerio';
import fetch from 'cross-fetch';

interface Metadata {
    title: string;
    description: string;
    image: string;
    icon: string;
}

export async function fetchUrlMetadata(url: string): Promise<Metadata> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';

        // Enhanced icon fetching
        let icon = $('link[rel="icon"]').attr('href') ||
            $('link[rel="shortcut icon"]').attr('href') ||
            $('link[rel="apple-touch-icon"]').attr('href') ||
            $('link[rel="fluid-icon"]').attr('href') ||
            '';

        const resolveUrl = (rel: string) => {
            try {
                return new URL(rel, url).toString();
            } catch {
                return rel;
            }
        };

        // Fallback to favicon.ico if no icon found
        if (!icon) {
            try {
                const faviconUrl = new URL('/favicon.ico', url).toString();
                const faviconRes = await fetch(faviconUrl, { method: 'HEAD' });
                if (faviconRes.ok) {
                    icon = faviconUrl;
                } else {
                    // Final fallback: Google Favicon Service
                    const urlObj = new URL(url);
                    icon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
                }
            } catch (e) {
                // Ignore fallback error
            }
        }

        return {
            title: title.trim(),
            description: description.trim(),
            image: image ? resolveUrl(image) : '',
            icon: icon ? resolveUrl(icon) : '',
        };
    } catch (error) {
        console.error('Metadata fetch error:', error);
        throw error;
    }
}
