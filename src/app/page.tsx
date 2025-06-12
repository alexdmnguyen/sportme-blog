// Home Page

import Link from 'next/link';
import Image from 'next/image';
import { 
  getSportsFromStrapi, 
  getCategoriesFromStrapi, 
  getLatestArticles, 
  getStrapiImageUrl 
} from '@/lib/strapi-client';
import { 
  StrapiSportListItem, 
  StrapiArticleListItem 
} from '@/lib/strapi-types';

// Revalidate page's data every 60 seconds.
export const revalidate = 60;

// --- HOMEPAGE COMPONENT ---
export default async function HomePage() {
  const sportsFromStrapi: StrapiSportListItem[] = await getSportsFromStrapi({ is_esport: false });
  const articles: StrapiArticleListItem[] = await getLatestArticles(8, { is_esport: false });

  const videoUrl = "https://videos.pexels.com/video-files/27951104/12271600_2560_1440_24fps.mp4";

  return (
    <main>

      {/* --- Hero/Welcome Section --- */}
      <section className="relative h-[50vh] sm:h-[35vh] w-full text-white overflow-hidden mb-12 lg:mb-16">
        <video
          className="absolute top-1/2 left-1/2 w-full h-full object-cover transform -translate-x-1/2 -translate-y-1/2"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative h-full flex flex-col justify-center items-center text-center p-4">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight drop-shadow-lg">
            Welcome to SAMBO SENTRAL!
          </h1>
          <p className="mt-4 text-base sm:text-xl max-w-2xl text-slate-200 drop-shadow-md">
            Your one-stop source for the latest news, rumors, and predictions.
          </p>
          <div className="mt-8">
            <Link
              href="/articles/sports"
              className="inline-block bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-500 transition-colors duration-300 shadow-xl transform hover:scale-105"
            >
              View All Sports Articles
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6">

        {/* --- Explore Sports Section --- */}
        <section className="w-full mb-12 lg:mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-200">Explore Sports</h2>
          {sportsFromStrapi.length > 0 ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
              {sportsFromStrapi.map((sport) => {
                const fullSportImageUrl = getStrapiImageUrl(sport.sport_image);
                return (
                  <Link key={sport.id} href={`/sports/${sport.slug}`} className="group block text-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-xl dark:border dark:border-slate-700 transition-all duration-300 hover:-translate-y-1">
                    {fullSportImageUrl ? (
                      <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600 transition-transform duration-300 group-hover:scale-110">
                        <Image
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
            <p className="text-slate-600 dark:text-slate-400 text-center">No sports found yet.</p>
          )}
        </section>

        {/* --- Latest Articles Section --- */}
        <section className="w-full mt-12 lg:mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-200">Latest Articles</h2>
          
          <div className="flex justify-center gap-8">
            <aside className="hidden lg:block w-48 flex-shrink-0">
              <div className="sticky top-24">
                <Link href="/advertising" className="block">
                  <Image 
                    src="/ad-placeholder.png" 
                    alt="Your Ad Here" 
                    className="rounded-lg shadow-md"
                    width={192}
                    height={600}
                  />
                </Link>
              </div>
            </aside>

            {articles.length > 0 ? (
              <div className="flex flex-col gap-12 max-w-5xl">
                {articles.map((article) => {
                  const fullArticleCoverUrl = getStrapiImageUrl(article.cover_image);
                  return (
                    <article key={article.id} className="group bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl dark:border dark:border-slate-700 transition-shadow duration-300 ease-in-out flex flex-col md:flex-row overflow-hidden">
                      {fullArticleCoverUrl && (
                        <div className="relative md:w-2/5 lg:w-1/3 flex-shrink-0 h-52 md:h-auto">
                          <Link href={`/articles/${article.slug}`} className="block h-full">
                            <Image
                              src={fullArticleCoverUrl}
                              alt={article.cover_image?.alternativeText || article.title || ''}
                              className="object-cover"
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base mb-4 flex-grow">
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
            
            <aside className="hidden lg:block w-48 flex-shrink-0">
              <div className="sticky top-24">
                <Link href="/advertising" className="block">
                  <Image 
                    src="/ad-placeholder.png" 
                    alt="Your Ad Here" 
                    className="rounded-lg shadow-md"
                    width={192}
                    height={600}
                  />
                </Link>
              </div>
            </aside>
          </div>
        </section>
        
        <div className="mt-8 text-center p-6">
          <Link href="/articles/sports" className="inline-block bg-indigo-600 text-white font-semibold py-3 px-15 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
            View All Sports Articles
          </Link>
        </div>
      </div>
    </main>
  );
}