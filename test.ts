import { userAgent } from './src/constants/index';
import ogs from 'open-graph-scraper';
(async () => {
    const options = {
        url: 'https://mikeodnis.dev',
        headers: { 'user-agent': userAgent },
    };
    const data = await ogs(options);
    const title = data.result.ogTitle;
    const description = data.result.ogDescription;
    const locale = data.result.ogLocale;
    const requestUrl = data.result.requestUrl;
    const ogImage = data.result.ogImage;
    if (Array.isArray(ogImage) && ogImage.length > 0) {
        const ogImageUrl = ogImage[0].url;
        console.log(ogImageUrl);
    } else {
        console.log('No ogImage found');
    }
})()