// Single Sport Pages

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticlesBySportSlug, getStrapiImageUrl } from '@/lib/strapi-client';
import { 
  StrapiSportPageData
} from '@/lib/strapi-types';


// --- METADATA FUNCTION ---
export async function generateMetadata(
  { params }: { params: { sport_slug: string } }
): Promise<Metadata> {
  const { sport } = await getArticlesBySportSlug(params.sport_slug);
  if (!sport) {
    return { title: 'Sport Not Found' };
  }
  return {
    title: `${sport.name} Articles | SamboBlog`,
    description: sport.description || `Latest articles and news about ${sport.name}.`,
  };
}

// --- PAGE COMPONENT ---
export const revalidate = 60; 

export default async function SportPage({ params }: { params: { sport_slug: string } }) {
  const { sport, articles }: StrapiSportPageData = await getArticlesBySportSlug(params.sport_slug);

  if (!sport) {
    notFound();
  }

  const fullSportImageUrl = getStrapiImageUrl(sport.sport_image);

  return (
    <main>
      {/* --- Full-Width Hero/Cover Section --- */}
      <section className="relative w-full h-100 md:h-64 lg:h-70 bg-slate-800 text-white overflow-hidden">
        {fullSportImageUrl ? (
          <Image 
            src={fullSportImageUrl} 
            alt={sport.sport_image?.alternativeText || sport.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110" 
            fill
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-700"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-center items-center text-center p-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-lg -mt-15">{sport.name} HUB</h1>
          {sport.description && (
            <p className="mt-4 text-lg sm:text-xl max-w-2xl text-slate-200 drop-shadow-md">{sport.description}</p>
          )}
        </div>
      </section>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 lg:-mt-28 -mt-42 mb-15">
        <div className="rounded-lg p-2 flex flex-wrap justify-center items-center gap-5">
          {sport.categories && sport.categories.length > 0 ? (
            sport.categories.map(category => (
              <Link 
                key={category.id}
                href={`/sports/${sport.slug}/${category.slug}`} 
                className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 lg:px-8 py-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 font-medium transition-colors text-sm"
              >
                {category.name}
              </Link>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No specific categories found for this sport.</p>
          )}
        </div>
      </div>

      {/* --- Articles List Section (with container for standard width) --- */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-[-4rem] sm:mt-[-0.5rem] mb-12">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {articles.map((article) => {
              const fullArticleCoverUrl = getStrapiImageUrl(article.cover_image);

              return (
                <div key={article.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl hover:shadow-2xl dark:border dark:border-slate-700 transition-all duration-300 ease-in-out flex flex-col overflow-hidden transform hover:-translate-y-1">
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                      <Link href={`/articles/${article.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {article.title || 'Untitled Article'}
                      </Link>
                    </h2>
                    {article.publishedAt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Published: {new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                    {article.excerpt && (
                      <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    {!article.excerpt && <div className="flex-grow min-h-[3em]"></div>}
                    <div className="mt-auto pt-2">
                        <Link href={`/articles/${article.slug}`} className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                            Read more &rarr;
                        </Link>
                    </div>
                  </div>
                  {fullArticleCoverUrl && (
                     <Link href={`/articles/${article.slug}`} className="block relative aspect-video overflow-hidden">
                      <Image 
                        src={fullArticleCoverUrl} 
                        alt={article.cover_image?.alternativeText || article.title || ''}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">No Articles Yet</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Check back soon for articles about {sport.name}!</p>
          </div>
        )}
      </div>
    </main>
  );
}