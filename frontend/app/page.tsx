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
    <div className="flex flex-col min-h-[calc(100vh-5rem)] items-center justify-center p-8 bg-white dark:bg-black font-sans selection:bg-black selection:text-white">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_var(--color-zinc-100)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_var(--color-zinc-900)_0%,_transparent_70%)] opacity-50 -z-10" />
      
      <main className="flex flex-col items-center gap-12 max-w-5xl w-full relative">
        <header className="text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-4">
            <span className="h-2 w-2 rounded-full bg-black dark:bg-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System v2.0 Operational</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-black dark:text-white leading-[0.9] uppercase italic">
            Precision <br />
            <span className="text-zinc-200 dark:text-zinc-800">Quoting</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto font-medium leading-relaxed">
            Automating the bridge between <span className="text-black dark:text-white font-black italic">engineering specs</span> and <span className="text-black dark:text-white font-black italic">commercial excellence</span>.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Card 
            variant="glass"
            className="p-10 border-none shadow-premium group cursor-pointer hover:scale-[1.01] transition-transform duration-500"
          >
            <div className="space-y-6">
               <div className="h-14 w-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="dark:stroke-black"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
               </div>
               <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-black dark:text-white">Initialize Draft</h3>
                  <p className="text-sm text-zinc-500 font-bold mt-2 uppercase tracking-widest leading-relaxed">Start a new quotation through our multi-step precision engine.</p>
               </div>
               <div className="pt-4">
                  <a href="/quotations/new">
                    <Button variant="primary" size="lg" className="w-full text-[10px] font-black uppercase tracking-[0.3em] h-14 rounded-2xl shadow-xl hover:shadow-2xl">
                       New Quotation
                    </Button>
                  </a>
               </div>
            </div>
          </Card>

          <Card 
            variant="outline"
            className="p-10 border-zinc-200 dark:border-zinc-800 group hover:border-black dark:hover:border-white transition-all duration-500"
          >
            <div className="space-y-6">
               <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M3 18h6"/><path d="M3 21h6"/></svg>
               </div>
               <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-black dark:text-white">Audit Ledger</h3>
                  <p className="text-sm text-zinc-500 font-bold mt-2 uppercase tracking-widest leading-relaxed">Review historical quotations, materials, and operational costs.</p>
               </div>
               <div className="pt-4">
                  <a href="/quotations">
                    <Button variant="outline" size="lg" className="w-full text-[10px] font-black uppercase tracking-[0.3em] h-14 rounded-2xl group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 transition-all">
                       Browse Library
                    </Button>
                  </a>
               </div>
            </div>
          </Card>
        </div>

        <footer className="pt-12 w-full flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900/50">
          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.4em]">
            Modular • Precision • Ledger
          </p>
          <div className="flex items-center gap-4">
              <span className="text-[9px] font-black uppercase text-zinc-300">Appwrite Linked:</span>
              <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-zinc-200 animate-pulse' : user ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
          </div>
        </footer>
      </main>
    </div>
  );
}
