// Home Page

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

// Revalidate page's data every 60 seconds.
export const revalidate = 60;

// --- HOMEPAGE COMPONENT ---
export default async function HomePage() {
  const sportsFromStrapi: StrapiSportListItem[] = await getSportsFromStrapi({ is_esport: false });
  const categoriesFromStrapi: StrapiCategoryListItem[] = await getCategoriesFromStrapi();
  const articles: StrapiArticleListItem[] = await getLatestArticles(5, { is_esport: false }); // Fetch latest 5 articles

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:py-12">
      
      {/* --- Hero/Welcome Section --- */}
      <section className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-slate-900 dark:text-slate-100 tracking-tight">Welcome to SAMBO SENTRAL!</h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">Your one-stop source for the latest news, rumors, and predictions.</p>
      </section>
      
      {/* --- Explore Sports Section --- */}
      <section className="w-full mb-16 ">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-200">Explore Sports</h2>
        {sportsFromStrapi.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sportsFromStrapi.map((sport) => {
              const fullSportImageUrl = getStrapiImageUrl(sport.sport_image);
              // console.log(`DEBUG (Browser Console) - Sport: ${sport.name}`);
              // console.log(`DEBUG (Browser Console) - sport.sport_image object:`, sport.sport_image);
              // console.log(`DEBUG (Browser Console) - Raw sportImageUrl from API: ${sport.sport_image?.url}`);
              // console.log(`DEBUG (Browser Console) - Constructed fullSportImageUrl: ${fullSportImageUrl}`);
              return (
                <Link key={sport.id} href={`/sports/${sport.slug}`} className="group block text-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-xl dark:border dark:border-slate-700 transition-all duration-300 hover:-translate-y-1">
                  {fullSportImageUrl ? (
                    <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600 transition-transform duration-300 group-hover:scale-110">
                      <img 
                        src={fullSportImageUrl} 
                        alt={sport.sport_image?.alternativeText || sport.name}
                        className="w-full h-full object-cover"
                        width={96} // Default width, can be overridden by actual image width if available
                        height={96} // Default height
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
          <p className="text-slate-600 dark:text-slate-400 text-center">No sports found yet.</p>
        )}
      </section>

      {/* --- Browse by Category Section --- */}
      {/* <section className="w-full mb-16">
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
      </section> */}

      {/* --- Latest Articles Section --- */}
      <section className="w-full mt-16"> {/* Changed mb-16 to mt-16 for consistency */}
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-200">Latest Articles</h2>
        {articles.length > 0 ? (
          <div className="flex flex-col gap-12 max-w-5xl mx-auto">
            {articles.map((article) => {
               const fullArticleCoverUrl = getStrapiImageUrl(article.cover_image);
              return (
                <article key={article.id} className="group bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl dark:border dark:border-slate-700 transition-shadow duration-300 ease-in-out flex flex-col md:flex-row overflow-hidden">
                  {fullArticleCoverUrl && (
                     <div className="md:w-2/5 lg:w-1/3 flex-shrink-0">
                      <Link href={`/articles/${article.slug}`} className="block h-52 md:h-full">
                        <img 
                          src={fullArticleCoverUrl} 
                          alt={article.cover_image?.alternativeText || article.title || ''}
                          className="w-100 h-75 object-cover"
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
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow">
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
          <p className="text-slate-600 dark:text-slate-400 text-center">No recent articles found.</p>
        )}
      </section>
      <div className="mt-8 text-center p-6">
        <Link href="/articles" className="inline-block bg-indigo-600 text-white font-semibold py-3 px-15 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
          View All Articles
        </Link>
      </div>
    </main>
  );
}
