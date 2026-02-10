import { NextRequest, NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) return NextResponse.json({ error: "No URL" });

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const debugInfo: any = {
            url,
            status: response.status,
            htmlLength: html.length,
            scriptsFound: 0,
            jsonLdSnippets: []
        };

        $('script[type="application/ld+json"]').each((_, el) => {
            debugInfo.scriptsFound++;
            const raw = $(el).text();
            try {
                const data = JSON.parse(raw);
                debugInfo.jsonLdSnippets.push({
                    length: raw.length,
                    isArray: Array.isArray(data),
                    types: Array.isArray(data) ? data.map(d => d['@type']) : data['@type'],
                    hasRecipe: JSON.stringify(data).includes('"Recipe"') || JSON.stringify(data).includes('Recipe')
                });
            } catch (e: any) {
                debugInfo.jsonLdSnippets.push({ error: e.message, rawSnippet: raw.substring(0, 100) });
            }
        });

        return NextResponse.json(debugInfo);
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack });
    }
}
