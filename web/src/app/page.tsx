"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Database, WifiOff, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="container mx-auto px-4 py-24 relative z-10 flex flex-col items-center justify-center text-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-block px-3 py-1 bg-muted/50 rounded-full text-sm font-medium border border-border/50 backdrop-blur-sm mb-4">
            v1.0 Early Access
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
            The Culinary Vault.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Distraction-free cooking for the intentional chef.
            <br />
            <span className="text-foreground font-semibold">Offline-first.</span> <span className="text-foreground font-semibold">No Ads.</span> <span className="text-foreground font-semibold">No AI Slop.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/vault">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                Enter Vault <ChefHat className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full backdrop-blur-sm bg-background/50 border-input/50 hover:bg-accent/50">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          id="features"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-6xl"
        >
          <FeatureCard
            icon={<WifiOff className="w-8 h-8 text-primary" />}
            title="Offline First"
            description="Your recipes live on your device. Cook in the remotest cabin without a connection."
          />
          <FeatureCard
            icon={<Database className="w-8 h-8 text-primary" />}
            title="Local Database"
            description="Instant search speeds using IndexedDB. You own your data, not us."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-primary" />}
            title="Cook Mode"
            description="High-contrast, wake-locked interface designed for messy hands and busy kitchens."
          />
        </motion.div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-card/40 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-colors duration-300">
      <CardHeader>
        <div className="mb-4 p-3 bg-primary/10 rounded-2xl w-fit">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
