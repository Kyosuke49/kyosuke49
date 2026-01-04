import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Music, Image as ImageIcon, FileText } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/music", label: "Music", icon: Music },
    { href: "/art", label: "Art", icon: ImageIcon },
    { href: "/writing", label: "Writing", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 sm:px-6 font-sans">
      <header className="py-8 sm:py-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <Link href="/" className="hover:opacity-70 transition-opacity">
              Pfötchengebendeningen
            </Link>
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            競介の個人サイト
          </p>
        </div>
        
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a 
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm border transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background text-foreground border-border hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 w-full py-4">
        {children}
      </main>

      <footer className="py-12 mt-12 border-t border-border text-center sm:text-left">
        <p className="text-sm text-muted-foreground font-mono">
          © {new Date().getFullYear()} Pfötchengebendeningen. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
