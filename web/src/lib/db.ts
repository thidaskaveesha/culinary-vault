import Dexie, { type Table } from 'dexie';

export interface Recipe {
    id?: number;
    title: string;
    sourceUrl?: string;
    imageUrl?: string;
    servings: number;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    ingredients: Ingredient[];
    instructions: InstructionStep[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Ingredient {
    original: string;
    name: string;
    amount: number;
    unit: string;
    aisle?: string;
}

export interface InstructionStep {
    text: string;
    time?: number; // timestamp in video if applicable
}

export class RecipeDatabase extends Dexie {
    recipes!: Table<Recipe>;

    constructor() {
        super('RecipeVaultDB');
        this.version(1).stores({
            recipes: '++id, title, sourceUrl, tags, createdAt'
        });
    }
}

export const db = new RecipeDatabase();
