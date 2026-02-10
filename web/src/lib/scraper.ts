import * as cheerio from 'cheerio';
import { Recipe, Ingredient, InstructionStep } from './db';

export async function scrapeRecipe(url: string): Promise<Partial<Recipe> | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch ${url}: ${response.statusText}`);
            return null;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Try to find JSON-LD
        let jsonLdData: any = null;
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const raw = $(el).text();
                // console.log('Found JSON-LD script, length:', raw.length); 
                const data = JSON.parse(raw);
                if (Array.isArray(data)) {
                    const recipe = data.find(item => {
                        const type = item['@type'];
                        return type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'));
                    });
                    if (recipe) {
                        jsonLdData = recipe;
                        // console.log('Found Recipe in JSON-LD array');
                    }
                } else {
                    const type = data['@type'];
                    if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
                        jsonLdData = data;
                        // console.log('Found Recipe in JSON-LD object');
                    } else if (data['@graph']) {
                        const recipe = data['@graph'].find((item: any) => {
                            const gType = item['@type'];
                            return gType === 'Recipe' || (Array.isArray(gType) && gType.includes('Recipe'));
                        });
                        if (recipe) {
                            jsonLdData = recipe;
                            // console.log('Found Recipe in JSON-LD graph');
                        }
                    }
                }
            } catch (e) {
                console.error('Error parsing JSON-LD', e);
            }
        });

        if (jsonLdData) {
            return parseSchemaOrgRecipe(jsonLdData, url);
        }

        // TODO: Fallback to microdata or heuristics if needed

        return null;

    } catch (error) {
        console.error('Scraping error:', error);
        return null;
    }
}

function parseSchemaOrgRecipe(data: any, sourceUrl: string): Partial<Recipe> {
    const title = data.name || 'Untitled Recipe';
    const imageUrl = Array.isArray(data.image) ? data.image[0] : (data.image?.url || data.image);

    // Parse ingredients
    const rawIngredients: string[] = Array.isArray(data.recipeIngredient) ? data.recipeIngredient : [data.recipeIngredient];
    const ingredients: Ingredient[] = rawIngredients.map(line => ({
        original: line,
        name: line, // Simple placeholder, real parsing requires NLP
        amount: 0,
        unit: 'unit'
    }));

    // Parse instructions
    let instructions: InstructionStep[] = [];
    if (Array.isArray(data.recipeInstructions)) {
        instructions = data.recipeInstructions.flat().map((step: any) => {
            if (typeof step === 'string') return { text: step };
            if (step['@type'] === 'HowToStep') return { text: step.text };
            return { text: step.text || JSON.stringify(step) };
        });
    } else if (typeof data.recipeInstructions === 'string') {
        instructions = [{ text: data.recipeInstructions }];
    }

    return {
        title,
        sourceUrl,
        imageUrl,
        ingredients,
        instructions,
        servings: parseInt(data.recipeYield) || 4,
        prepTimeMinutes: parseDuration(data.prepTime),
        cookTimeMinutes: parseDuration(data.cookTime),
        tags: data.keywords ? (Array.isArray(data.keywords) ? data.keywords : data.keywords.split(',').map((s: string) => s.trim())) : [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

function parseDuration(durationStr: string): number {
    if (!durationStr) return 0;
    // Basic ISO 8601 duration parser (PT1H30M)
    const match = durationStr.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return 0;
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    return hours * 60 + minutes;
}
