'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { appwriteService } from "@/services/AppwriteService";
import { Models } from "appwrite";

export default function Home() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const currentUser = await appwriteService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    checkUser();
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-black dark:text-white">
            Quotation <span className="text-zinc-400">App</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            A premium, modular foundation for your business.
          </p>
        </header>

        <Card 
          title="Project Status" 
          description="The repository has been structured for scalability."
          className="w-full"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900">
              <span className="text-sm font-medium">Appwrite Connectivity</span>
              {isLoading ? (
                <span className="text-xs text-zinc-400">Checking...</span>
              ) : user ? (
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Connected</span>
              ) : (
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Guest Mode</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="md" className="w-full">
                View Docs
              </Button>
              <Button variant="primary" size="md" className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </Card>

        <footer className="pt-8 border-t border-zinc-200 dark:border-zinc-800 w-full text-center">
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold font-mono">
            Modular • OOP • Reusable
          </p>
        </footer>
      </main>
    </div>
  );
}
