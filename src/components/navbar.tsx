// Navbar
"use client";

import Link from "next/link";
import { usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

function formatSlugToTitle(slug: string | undefined): string {
    if (!slug) return '';
    return slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

export function ContextualNavbar() {
  const pathname = usePathname();
  const params = useParams<{ sport_slug?: string; }>(); 
  
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if we are on a sport-related page
  const isSportPage = pathname.startsWith('/sports/');
  const sportName = isSportPage ? formatSlugToTitle(params.sport_slug) : '';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        
        <div className="flex-1 flex justify-start">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">
            SAMBO NEWS
          </Link>
        </div>

        <div className="flex-1 flex justify-center h-8 items-center">
          {isSportPage && sportName && (
            <Link 
              href={`/sports/${params.sport_slug}`}
              className={`
                text-lg font-semibold text-indigo-600 dark:text-white uppercase
                transition-opacity duration-300
                ${isScrolled ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {sportName} Hub
            </Link>
          )}
        </div>
        
        <div className="flex-1 flex justify-end items-center space-x-6">
          <Link href="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Sports Hub
          </Link>
          <Link href="/articles" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            All Articles
          </Link>
          <Link href="/esports" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            eSports Hub
          </Link>
        </div>
      </nav>
    </header>
  );
}
