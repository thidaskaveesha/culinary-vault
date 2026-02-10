"use client";

import { useEffect, useState } from "react";
import { db, Recipe } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ChefHat, Trash2, Loader2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function VaultPage() {
    const recipes = useLiveQuery(() => db.recipes.toArray());
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImport = async () => {
        if (!url) return;
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/ingest?url=${encodeURIComponent(url)}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to import");

            await db.recipes.add({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            setUrl("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Delete this recipe?")) {
            await db.recipes.delete(id);
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Culinary Vault</h1>
                    <p className="text-muted-foreground mt-2">Your offline recipe collection.</p>
                </div>

                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-96">
                        <Input
                            placeholder="Paste recipe URL..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="pr-12"
                        />
                        {loading && <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />}
                    </div>
                    <Button onClick={handleImport} disabled={loading || !url}>
                        <Plus className="mr-2 h-4 w-4" /> Import
                    </Button>
                </div>
            </header>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-8 border border-destructive/20">
                    {error}
                </div>
            )}

            {recipes?.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <ChefHat className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">The vault is empty</h2>
                    <p>Paste a URL above to add your first recipe.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {recipes?.map((recipe) => (
                        <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                        >
                            <Card className="h-full flex flex-col hover:border-primary/50 transition-colors group">
                                <div className="aspect-video w-full bg-muted relative overflow-hidden rounded-t-lg">
                                    {recipe.imageUrl ? (
                                        <img src={recipe.imageUrl} alt={recipe.title} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <ChefHat className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1 text-xl">{recipe.title}</CardTitle>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3" /> {recipe.sourceUrl ? new URL(recipe.sourceUrl).hostname : 'Manual Entry'}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        <span>{recipe.ingredients.length} Ingredients</span>
                                        <span>•</span>
                                        <span>{recipe.cookTimeMinutes || 15} mins</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between gap-2">
                                    <Link href={`/cook/${recipe.id}`} className="flex-1">
                                        <Button className="w-full" variant="secondary">Cook Mode</Button>
                                    </Link>
                                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(recipe.id!)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
