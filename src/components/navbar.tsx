"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Package className="h-5 w-5 text-emerald-600" />
          PantryRun
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </Link>
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/donate">Donate Now</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
