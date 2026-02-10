"use client";

import { useEffect, useState, use } from "react";
import { db, Recipe } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Users, Play, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

    useEffect(() => {
        const load = async () => {
            const r = await db.recipes.get(parseInt(id));
            setRecipe(r || null);
        };
        load();
    }, [id]);

    useEffect(() => {
        // Request Wake Lock
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    const lock = await navigator.wakeLock.request('screen');
                    setWakeLock(lock);
                    console.log("Wake Lock active");
                }
            } catch (err) {
                console.error("Wake Lock failed:", err);
            }
        };
        requestWakeLock();

        return () => {
            wakeLock?.release();
        };
    }, []);

    if (!recipe) return <div className="p-8">Loading recipe...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b z-20 px-6 py-4 flex items-center justify-between">
                <Link href="/vault">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                </Link>
                <h1 className="font-bold text-lg truncate max-w-xs">{recipe.title}</h1>
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {recipe.cookTimeMinutes}m</span>
                    <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> {recipe.servings}</span>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl p-6 grid md:grid-cols-[1fr_2fr] gap-12">

                {/* Ingredients Column */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-primary">Ingredients</h2>
                    <ul className="space-y-3">
                        {recipe.ingredients.map((ing, i) => (
                            <li key={i} className="p-3 rounded-lg bg-secondary/50 flex items-start gap-3 text-lg leading-snug">
                                <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                                {ing.original}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Instructions Column */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-primary">Instructions</h2>
                    <div className="space-y-8">
                        {recipe.instructions.map((step, i) => (
                            <div
                                key={i}
                                onClick={() => setActiveStep(i)}
                                className={cn(
                                    "p-6 rounded-2xl border transition-all cursor-pointer",
                                    activeStep === i
                                        ? "bg-primary text-primary-foreground shadow-xl scale-105 border-primary"
                                        : "bg-card hover:bg-accent/50 border-input opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <span className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full font-bold",
                                        activeStep === i ? "bg-white text-primary" : "bg-muted text-foreground"
                                    )}>
                                        {i + 1}
                                    </span>
                                    {activeStep === i && <span className="text-sm font-medium uppercase tracking-wider opacity-80">Current Step</span>}
                                </div>
                                <p className="text-2xl leading-relaxed font-medium">
                                    {step.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
