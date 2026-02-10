import { NextRequest, NextResponse } from "next/server";
import { scrapeRecipe } from "@/lib/scraper";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    try {
        const recipe = await scrapeRecipe(url);

        if (!recipe) {
            return NextResponse.json({ error: "Could not extract recipe data. Ensure the site supports Schema.org/Recipe." }, { status: 422 });
        }

        return NextResponse.json(recipe);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
