// Single Sport Pages

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import { getArticlesBySportSlug, getStrapiImageUrl } from '@/lib/strapi-client';
import { 
  StrapiSportPageData,
  StrapiArticleListItem,
  StrapiRelatedItem,
  DirectStrapiMediaObject
} from '@/lib/strapi-types';

// --- PROPS INTERFACE ---
interface SportPageProps {
  params: {
    sport_slug: string;
  };
}

// --- METADATA FUNCTION ---
export async function generateMetadata(
  { params }: SportPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { sport } = await getArticlesBySportSlug(params.sport_slug);
  if (!sport) {
    return { title: 'Sport Not Found' };
  }
  return {
    title: `${sport.name} Articles | SamboBlog`,
    description: sport.description || `Latest articles and news about ${sport.name}.`,
    // openGraph: { images: [getStrapiImageUrl(sport.sport_image) || ''] }
  };
}

// --- PAGE COMPONENT ---
export const revalidate = 60; // Revalidate this page every 60 seconds

export default async function SportPage({ params }: SportPageProps) {
  const { sport, articles }: StrapiSportPageData = await getArticlesBySportSlug(params.sport_slug);

  if (!sport) {
    notFound();
  }

  const fullSportImageUrl = getStrapiImageUrl(sport.sport_image);

  return (
    <main>
      {/* --- Full-Width Hero/Cover Section --- */}
      <section className="relative w-full h-72 md:h-80 lg:h-96 bg-slate-800 text-white overflow-hidden">
        {fullSportImageUrl ? (
          <img 
            src={fullSportImageUrl} 
            alt={sport.sport_image?.alternativeText || sport.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110" 
            width={sport.sport_image?.width} // Optional: for layout stability
            height={sport.sport_image?.height} // Optional: for layout stability
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-700"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-center items-center text-center p-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-lg">{sport.name}</h1>
          {sport.description && (
            <p className="mt-4 text-lg sm:text-xl max-w-2xl text-slate-200 drop-shadow-md">{sport.description}</p>
          )}
        </div>
      </section>

      {/* --- Articles List Section (with container for standard width) --- */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-[-4rem] sm:mt-[-5rem] mb-12">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"> {/* Max 2 columns, centered */}
            {articles.map((article) => {
              const fullArticleCoverUrl = getStrapiImageUrl(article.cover_image);
              // const categoryInfo = article.categories?.[0];

              return (
                <div key={article.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl hover:shadow-2xl dark:border dark:border-slate-700 transition-all duration-300 ease-in-out flex flex-col overflow-hidden transform hover:-translate-y-1">
                  {/* Text Content First */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                      <Link href={`/articles/${article.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {article.title || 'Untitled Article'}
                      </Link>
                    </h2>
                     {/* Display Categories if available 
                     {article.categories && article.categories.length > 0 && (
                       <div className="flex flex-wrap gap-2 mb-2">
                         {article.categories.map(cat => (
                           <Link key={cat.id} href={`/categories/${cat.slug}`} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">
                             {cat.name}
                           </Link>
                         ))}
                       </div>
                     )}*/}
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
                      {article.slug ? (
                        <Link href={`/articles/${article.slug}`} className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                            Read more &rarr;
                        </Link>
                      ) : (
                        <p className="text-sm text-red-500">Article slug missing.</p>
                      )}
                    </div>
                  </div>
                  {/* Image Last */}
                  {fullArticleCoverUrl && (
                     <Link href={`/articles/${article.slug}`} className="block relative aspect-video overflow-hidden"> {/* aspect-video maintains 16:9 */}
                      <img 
                        src={fullArticleCoverUrl} 
                        alt={article.cover_image?.alternativeText || article.title || ''}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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

// Optional: For pre-rendering paths at build time
// export async function generateStaticParams() {
//   const sports = await getSportsFromStrapi(); // Assuming getSportsFromStrapi exists in strapi-client
//   return sports.map((sport) => ({
//     sport_slug: sport.slug,
//   }));
// }
