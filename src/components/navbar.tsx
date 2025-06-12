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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isSportPage = pathname.startsWith('/sports/');
  const sportName = isSportPage ? formatSlugToTitle(params.sport_slug) : '';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        
        <div className="flex-shrink-0">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
            SAMBO NEWS
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center h-8 items-center">
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
        
        
        <div className="hidden md:flex items-center space-x-6">
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

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

      </nav>

      <div className={`
        fixed inset-0 z-50 bg-white dark:bg-slate-900
        transform transition-transform duration-300 ease-in-out
        md:hidden
        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="absolute top-0 right-0 pt-3 pr-4">
          <button 
            onClick={() => setIsMenuOpen(false)} 
            aria-label="Close menu"
            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-start pt-24 space-y-8">
          <Link href="/" className="text-2xl font-bold text-slate-800 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
            Sports Hub
          </Link>
          <Link href="/articles" className="text-2xl font-bold text-slate-800 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
            All Articles
          </Link>
          <Link href="/esports" className="text-2xl font-bold text-slate-800 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
            eSports Hub
          </Link>
        </div>
      </div>
    </header>
  );
}