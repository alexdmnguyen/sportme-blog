import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// revalidate page's data every 60 seconds.
export const revalidate = 60;

// --- Supabase Data Fetching ---
async function getSports() {
  const { data: sports, error } = await supabase
    .from('sports')
    .select('id, name, slug');

  if (error) {
    console.error('Error fetching sports from Supabase:', error);
    return [];
  }
  return sports || [];
}

// --- Strapi Data Fetching & Interfaces ---
interface StrapiArticle {
  id: number;
  title: string;
  slug: string | null;
  excerpt?: string | null;
  main_content?: any;
  publication_date?: string | null;
  cover_image?: any;
  sport_slug?: string;
  category_slug?: string;
  ai_assisted?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface DirectStrapiMediaObject {
    id: number;
    url: string;
    alternativeText?: string | null;
    width?: number;
    height?: number;
    formats?: { [key: string]: { url: string; /* other format props */ } };
}

interface StrapiSportListItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sport_image?: DirectStrapiMediaObject | null;
}

interface StrapiCategoryListItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  // Add 'category_image?: DirectStrapiMediaObject | null;'
}

interface StrapiArticleListItem {
  id: number;
  title: string;
  slug: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  cover_image?: DirectStrapiMediaObject | null;
}

async function getSportsFromStrapi(): Promise<StrapiSportListItem[]> {
  console.log("DEBUG: NEXT_PUBLIC_STRAPI_API_URL from process.env:", process.env.NEXT_PUBLIC_STRAPI_API_URL);
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  if (!strapiUrl) {
    console.error("Strapi URL is not defined (getSportsFromStrapi).");
    return [];
  }

  const populateSportImageParams = [
    'populate[sport_image][fields][0]=name',
    'populate[sport_image][fields][1]=alternativeText',
    'populate[sport_image][fields][2]=url',
    'populate[sport_image][fields][3]=width',
    'populate[sport_image][fields][4]=height',
    'populate[sport_image][fields][5]=formats'
  ].join('&');

  const endpoint = `${strapiUrl}/sports?${populateSportImageParams}&sort[0]=name:asc`;
  
  console.log(`DEBUG: Fetching Sports from Strapi (Homepage): ${endpoint}`);

  try {
    const res = await fetch(endpoint, {
      headers: { ...(strapiToken && { 'Authorization': `Bearer ${strapiToken}` }) },
      cache: 'no-store', 
    });

    const responseText = await res.text();
    if (!res.ok) {
      console.error('DEBUG: Failed to fetch Sports from Strapi (Homepage):', res.status, responseText);
      return [];
    }
    
    const jsonResponse = JSON.parse(responseText);
    // console.log('DEBUG: Strapi Sports API Response (Homepage):', JSON.stringify(jsonResponse, null, 2));

    if (jsonResponse && Array.isArray(jsonResponse.data)) {
      return jsonResponse.data.filter(
        (item: any) => item && typeof item.name !== 'undefined' && typeof item.slug !== 'undefined'
      ) as StrapiSportListItem[];
    }
    console.warn('DEBUG: Sports data from Strapi was not in the expected format:', jsonResponse);
    return [];
  } catch (error: any) {
    console.error('DEBUG: Error in getSportsFromStrapi (catch block):', error.message, error.stack);
    return [];
  }
}

async function getCategoriesFromStrapi(): Promise<StrapiCategoryListItem[]> {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  if (!strapiUrl) {
    console.error("Strapi URL is not defined (getCategoriesFromStrapi).");
    return [];
  }

  const endpoint = `${strapiUrl}/categories?fields[0]=name&fields[1]=slug&fields[2]=description&sort[0]=name:asc`;

  try {
    const res = await fetch(endpoint, {
      headers: { ...(strapiToken && { 'Authorization': `Bearer ${strapiToken}` }) },
      cache: 'no-store',
    });
    const responseText = await res.text();
    if (!res.ok) {
      console.error('DEBUG: Failed to fetch Categories from Strapi (Homepage):', res.status, responseText);
      return [];
    }
    const jsonResponse = JSON.parse(responseText);
    // console.log('DEBUG: Strapi Categories API Response (Homepage):', JSON.stringify(jsonResponse, null, 2));
    if (jsonResponse && Array.isArray(jsonResponse.data)) {
      return jsonResponse.data.filter(
        (item: any) => item && typeof item.name !== 'undefined' && typeof item.slug !== 'undefined'
      ) as StrapiCategoryListItem[];
    }
    return [];
  } catch (error: any) {
    console.error('DEBUG: Error in getCategoriesFromStrapi (Homepage):', error.message);
    return [];
  }
}


async function getStrapiArticles(): Promise<StrapiArticle[]> {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  if (!strapiUrl) {
    console.error("Strapi URL is not defined in environment variables (Homepage).");
    return [];
  }

  const endpoint = `${strapiUrl}/articles?populate=*&sort[0]=publishedAt:desc&pagination[limit]=5`; // Fetch latest 5 for homepage
  // console.log(`Fetching Strapi articles from (Homepage): ${endpoint}`);

  try {
    const res = await fetch(endpoint, {
      headers: {
        ...(strapiToken && { 'Authorization': `Bearer ${strapiToken}` }),
      },
      // cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to fetch Strapi articles (Homepage - server response not OK):', res.status, errorText);
      return [];
    }

    const jsonResponse = await res.json();
    // console.log('Strapi Raw API Response (Homepage):', JSON.stringify(jsonResponse, null, 2));

    if (jsonResponse && Array.isArray(jsonResponse.data)) {
      const validArticles = jsonResponse.data.filter(
        (item: any) => item && typeof item.title !== 'undefined' && item.slug 
      );
      
      if (validArticles.length !== jsonResponse.data.length) {
        // console.warn('Some Strapi articles were filtered out (Homepage - missing title or slug). Original data:', jsonResponse.data);
      }
      return validArticles as StrapiArticle[];
    } else {
      console.error('Strapi response data is not in the expected format (Homepage):', jsonResponse);
      return [];
    }
  } catch (error) {
    console.error('Error fetching Strapi articles (Homepage - catch block):', error);
    return [];
  }
}

// --- HOMEPAGE COMPONENT ---
export default async function HomePage() {
  const sportsFromStrapi = await getSportsFromStrapi();
  const categoriesFromStrapi = await getCategoriesFromStrapi();
  const articles = await getStrapiArticles();
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || '';

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:py-12">
      
      {/* --- Hero/Welcome Section --- */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 text-slate-900 dark:text-slate-100 tracking-tight">Welcome to SAMBO SENTRAL!</h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">Your one-stop source for the latest news, rumors, and predictions.</p>
        <div className="mt-8">
          <Link href="/articles" className="inline-block bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
            View All Articles
          </Link>
        </div>
      </section>
      
      {/* --- Explore Sports Section --- */}
      <section className="w-full mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-200">Explore Sports</h2>
        {sportsFromStrapi.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sportsFromStrapi.map((sport) => {
              const sportImageUrl = sport.sport_image?.url;
              const fullSportImageUrl = sportImageUrl
                ? (sportImageUrl.startsWith('/') ? `${strapiBaseUrl}${sportImageUrl}` : sportImageUrl)
                : null;
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
                      {/* Fallback Icon or Initials */}
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

      {/* --- Latest Articles Section --- */}
      <section className="w-full mt-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-200">Latest Articles</h2>
        {articles.length > 0 ? (
          <div className="flex flex-col gap-12 max-w-5xl mx-auto">
            {articles.map((article) => {
               const articleCoverImageUrlFromAPI = article.cover_image?.url;
               const fullArticleCoverUrl = articleCoverImageUrlFromAPI
                 ? (articleCoverImageUrlFromAPI.startsWith('/') ? `${strapiBaseUrl}${articleCoverImageUrlFromAPI}` : articleCoverImageUrlFromAPI)
                 : null;

              return (
                // Each article is a flex container: vertical on mobile, horizontal on medium+ screens
                <article key={article.id} className="group bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl dark:border dark:border-slate-700 transition-shadow duration-300 ease-in-out flex flex-col md:flex-row overflow-hidden">
                  
                  {/* Left Side: Image Container (Fixed Size) */}
                  {fullArticleCoverUrl && (
                     <div className="md:w-2/5 lg:w-1/3">
                      <Link href={`/articles/${article.slug}`} className="block h-full">
                        <img 
                          src={fullArticleCoverUrl} 
                          alt={article.cover_image?.alternativeText || article.title || ''}
                          className="w-full h-55 object-cover transition-transform duration-300 group-hover:scale-105" // Zoom on hover of parent card
                          width={article.cover_image?.width || 400}
                          height={article.cover_image?.height || 225}
                        />
                      </Link>
                    </div>
                  )}

                  {/* Right Side: Text Content */}
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
                    <div className="mt-auto">
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

    </main>
  );
}