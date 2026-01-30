"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-teal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">Dashwill</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            How it Works
          </Link>
          {isHome ? (
            <Button
              asChild
              className="rounded-full gradient-teal border-0 px-5 text-sm font-medium text-white shadow-teal hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/donate">Donate Now</Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="rounded-full border-teal-600 px-5 text-sm font-medium text-teal-600 hover:bg-teal-50 transition-all"
            >
              <Link href="/donate">Donate Now</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
