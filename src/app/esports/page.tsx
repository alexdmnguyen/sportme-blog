// eSports HUB

import Link from 'next/link';
import { 
  getSportsFromStrapi, 
  getCategoriesFromStrapi, 
  getLatestArticles, 
  getStrapiImageUrl 
} from '@/lib/strapi-client';
import { 
  StrapiSportListItem, 
  StrapiCategoryListItem, 
  StrapiArticleListItem 
} from '@/lib/strapi-types';

export const revalidate = 60; // Revalidate page's data every 60 seconds

// --- ESPORTS HOMEPAGE COMPONENT ---
export default async function EsportsHomePage() {
  // Fetch ONLY esports
  const esportsSports: StrapiSportListItem[] = await getSportsFromStrapi({ is_esport: true });
  // Fetch all categories for now - can be filtered later if needed
  const categoriesFromStrapi: StrapiCategoryListItem[] = await getCategoriesFromStrapi(); 
  // Fetch latest articles that BELONG to an esport
  const esportsArticles: StrapiArticleListItem[] = await getLatestArticles(5, { is_esport: true }); 

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:py-12">
      
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 text-slate-900 dark:text-slate-100 tracking-tight">Welcome to the Esports Hub!</h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">Your central source for all things esports: news, tournaments, and analysis.</p>
        {/* Optional: Link to all esports articles if you create such a page */}
        {/* <div className="mt-8">
          <Link href="/esports/articles" className="inline-block bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
            All Esports Articles
          </Link>
        </div> */}
      </section>
      
      {/* --- Explore Esports Titles Section --- */}
      <section className="w-full mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-200">Featured Esports</h2>
        {esportsSports.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {esportsSports.map((sport) => {
              const fullSportImageUrl = getStrapiImageUrl(sport.sport_image);
              return (
                <Link key={sport.id} href={`/sports/${sport.slug}`} className="group block text-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-xl dark:border dark:border-slate-700 transition-all duration-300 hover:-translate-y-1">
                  {fullSportImageUrl ? (
                    <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600 transition-transform duration-300 group-hover:scale-110">
                      <img 
                        src={fullSportImageUrl} 
                        alt={sport.sport_image?.alternativeText || sport.name}
                        className="w-full h-full object-cover"
                        width={96}
                        height={96}
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <span className="text-3xl font-bold text-slate-500">{sport.name.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-lg font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {sport.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 text-center">No esports titles found yet.</p>
        )}
      </section>

      {/* --- Browse by Category Section (Shows all categories for now) --- */}
      <section className="w-full mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-200">Browse by Category</h2>
        {categoriesFromStrapi.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {categoriesFromStrapi.map((category) => (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`} 
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-5 py-2 rounded-full text-sm sm:text-md font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 text-center">No categories found yet.</p>
        )}
      </section>

      {/* --- Latest Esports Articles Section --- */}
      <section className="w-full mt-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-200">Latest Esports Articles</h2>
        {esportsArticles.length > 0 ? (
          <div className="flex flex-col gap-12 max-w-5xl mx-auto">
            {esportsArticles.map((article) => {
               const fullArticleCoverUrl = getStrapiImageUrl(article.cover_image);
              return (
                <article key={article.id} className="group bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl dark:border dark:border-slate-700 transition-shadow duration-300 ease-in-out flex flex-col md:flex-row overflow-hidden">
                  {fullArticleCoverUrl && (
                     <div className="md:w-2/5 lg:w-1/3 flex-shrink-0">
                      <Link href={`/articles/${article.slug}`} className="block h-52 md:h-full">
                        <img 
                          src={fullArticleCoverUrl} 
                          alt={article.cover_image?.alternativeText || article.title || ''}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    </div>
                  )}
                  <div className="flex flex-col p-6 md:w-3/5 lg:w-2/3">
                    <h3 className="text-xl lg:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                      <Link href={`/articles/${article.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {article.title || 'Untitled Article'}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Published: {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Date not available'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="mt-auto pt-4">
                      <Link href={`/articles/${article.slug}`} className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                        Read more &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 text-center">No recent esports articles found.</p>
        )}
      </section>
    </main>
  );
}
