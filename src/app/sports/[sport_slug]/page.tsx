import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

// --- INTERFACES ---
interface StrapiMediaFormat { url: string; width?: number; height?: number; /* ... */ }
interface DirectStrapiMediaObject {
  id: number;
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: { [key: string]: StrapiMediaFormat };
}

interface StrapiRelatedCategoryForArticle { 
  id: number;
  name: string;
  slug: string;
}

interface StrapiArticleListItem {
  id: number;
  title: string;
  slug: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  cover_image?: DirectStrapiMediaObject | null;
  categories?: { data?: StrapiRelatedCategoryForArticle[] };
}

interface StrapiSportDetails {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sport_image?: DirectStrapiMediaObject | null;
}

interface SportPageData {
  sport: StrapiSportDetails | null;
  articles: StrapiArticleListItem[];
}

// --- DATA FETCHING FUNCTION ---
async function getSportDetailsAndArticles(sportSlug: string): Promise<SportPageData> {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  let sportData: StrapiSportDetails | null = null;
  let articlesData: StrapiArticleListItem[] = [];

  if (!strapiUrl) {
    console.error("Strapi URL is not defined (getSportDetailsAndArticles).");
    return { sport: null, articles: [] };
  }

  console.log(`DEBUG (Server Console) - getSportDetailsAndArticles received sportSlug: "${sportSlug}"`);

  try {
    // 1. Fetch Sport Details
    const populateSportImageParams = [
      'populate[sport_image][fields][0]=name',
      'populate[sport_image][fields][1]=alternativeText',
      'populate[sport_image][fields][2]=url',
      'populate[sport_image][fields][3]=width',
      'populate[sport_image][fields][4]=height',
      'populate[sport_image][fields][5]=formats'
    ].join('&');
    
    const sportEndpoint = `${strapiUrl}/sports?filters[slug][$eq]=${sportSlug}&${populateSportImageParams}`;
    console.log(`DEBUG (Server Console) - Fetching Sport Details from: ${sportEndpoint}`);
    
    const sportRes = await fetch(sportEndpoint, { headers: { ...(strapiToken && { Authorization: `Bearer ${strapiToken}` }) }, cache: 'no-store' });
    const sportResText = await sportRes.text(); // Get text for debugging

    if (sportRes.ok) {
      const sportJsonResponse = JSON.parse(sportResText);
      // *** DEBUGGING: Log the response for sport details ***
      console.log(`DEBUG (Server Console) - Sport Details JSON Response for slug "${sportSlug}":`, JSON.stringify(sportJsonResponse, null, 2));

      if (sportJsonResponse && Array.isArray(sportJsonResponse.data) && sportJsonResponse.data.length > 0) {
        sportData = sportJsonResponse.data[0] as StrapiSportDetails; 
      } else {
        console.warn(`DEBUG (Server Console) - No sport found for slug "${sportSlug}" in sportJsonResponse.data`);
      }
    } else {
      console.error(`DEBUG: Failed to fetch sport details for ${sportSlug}:`, sportRes.status, sportResText);
    }

    if (sportData) {
      const articlesPopulate = [
        'populate[cover_image][fields][0]=url',
        'populate[cover_image][fields][1]=alternativeText',
        'populate[cover_image][fields][2]=width',
        'populate[cover_image][fields][3]=height',
        // 'populate[cover_image][fields][4]=formats',
        
        'populate[categories][fields][0]=name',
        'populate[categories][fields][1]=slug'
      ].join('&');
      
      const articlesEndpoint = `${strapiUrl}/articles?filters[sport][slug][$eq]=${sportSlug}&${articlesPopulate}&sort[0]=publishedAt:desc`;
      console.log(`DEBUG (Server Console) - Fetching Articles for Sport "${sportSlug}" from: ${articlesEndpoint}`);

      const articlesRes = await fetch(articlesEndpoint, { headers: { ...(strapiToken && { Authorization: `Bearer ${strapiToken}` }) }, cache: 'no-store' });
      const articlesResText = await articlesRes.text(); // Get text for debugging

      if (articlesRes.ok) {
        const articlesJsonResponse = JSON.parse(articlesResText);
        // *** DEBUGGING: Log the response for articles list ***
        console.log(`DEBUG (Server Console) - Articles for Sport "${sportSlug}" JSON Response:`, JSON.stringify(articlesJsonResponse, null, 2));

        if (articlesJsonResponse && Array.isArray(articlesJsonResponse.data)) {
          articlesData = articlesJsonResponse.data.filter(
            (item: any) => item && typeof item.title !== 'undefined' && item.slug
          ) as StrapiArticleListItem[];
        } else {
            console.warn(`DEBUG (Server Console) - No articles found for sport "${sportSlug}" or data format unexpected in articlesJsonResponse.data`);
        }
      } else {
        console.error(`DEBUG: Failed to fetch articles for sport ${sportSlug} (articlesRes not OK):`, articlesRes.status, articlesResText);
      }
    } else {
        console.warn(`DEBUG (Server Console) - Skipping fetching articles because sportData for slug "${sportSlug}" was not found or is null.`);
    }
    
  } catch (error: any) {
    console.error(`DEBUG: Error in getSportDetailsAndArticles for ${sportSlug} (outer catch block):`, error.message, error.stack);
  }
  
  return { sport: sportData, articles: articlesData };
}

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
  const { sport } = await getSportDetailsAndArticles(params.sport_slug);
  if (!sport) {
    return { title: 'Sport Not Found' };
  }
  return {
    title: `${sport.name} Articles | SportsBlogPro`,
    description: sport.description || `Latest articles and news about ${sport.name}.`,
  };
}

// --- PAGE COMPONENT ---

export default async function SportPage({ params }: SportPageProps) {
  const { sport, articles } = await getSportDetailsAndArticles(params.sport_slug);
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || '';

  if (!sport) {
    notFound(); // Triggers 404 page
  }

  const sportImageUrlFromAPI = sport.sport_image?.url;
  const fullSportImageUrl = sportImageUrlFromAPI
    ? (sportImageUrlFromAPI.startsWith('/') ? `${strapiBaseUrl}${sportImageUrlFromAPI}` : sportImageUrlFromAPI)
    : null;

  return (
    <main>
      {/* --- Full-Width Hero/Cover Section --- */}
      <section className="relative w-full h-60 md:h-65 lg:h-70 bg-gray-800 text-white overflow-hidden">
        {fullSportImageUrl ? (
          <img 
            src={fullSportImageUrl} 
            alt={sport.sport_image?.alternativeText || sport.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110" 
            width={sport.sport_image?.width}
            height={sport.sport_image?.height}
          />
        ) : (
          // Fallback solid color if no image
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-700"></div>
        )}

        <div className="absolute inset-0 bg-black/75"></div>

        <div className="relative h-full flex flex-col justify-center items-center text-center p-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-lg">{sport.name}</h1>
          {sport.description && (
            <p className="mt-4 text-lg sm:text-xl max-w-2xl text-gray-200 drop-shadow-md">{sport.description}</p>
          )}
        </div>
      </section>

      {/* --- Articles List Section (with container for standard width) --- */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-[-4rem] sm:mt-[-5rem]">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-25 max-w-5xl mx-auto">
            {articles.map((article) => {
              // Construct the article's cover image URL
              const articleCoverImageUrlFromAPI = article.cover_image?.url;
              const fullArticleCoverUrl = articleCoverImageUrlFromAPI
                ? (articleCoverImageUrlFromAPI.startsWith('/') ? `${strapiBaseUrl}${articleCoverImageUrlFromAPI}` : articleCoverImageUrlFromAPI)
                : null;
              
              const sportInfo = article.sport?.data;

                return (
                    <div key={article.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col overflow-hidden">
                    
                    <div className="p-6 flex flex-col flex-grow">
                        <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                        <Link href={`/articles/${article.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            {article.title || 'Untitled Article'}
                        </Link>
                        </h2>
                        
                        {article.publishedAt && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            {new Date(article.publishedAt).toLocaleDateString()}
                        </p>
                        )}

                        {article.excerpt && <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow">{article.excerpt}</p>}
                        
                        {!article.excerpt && <div className="flex-grow"></div>} 
                        
                        <div className="mt-auto">
                        <Link href={`/articles/${article.slug}`} className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                            Read more &rarr;
                        </Link>
                        </div>
                    </div>

                    {fullArticleCoverUrl && (
                        <Link href={`/articles/${article.slug}`} className="block relative">
                        {/* The overflow-hidden on the parent will clip the bottom corners of this image */}
                        <img 
                            src={fullArticleCoverUrl} 
                            alt={article.cover_image?.alternativeText || article.title}
                            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" // Note: group-hover might be needed if hover is on parent
                            width={article.cover_image?.width || 400}
                            height={article.cover_image?.height || 225}
                        />
                        </Link>
                    )}
                    </div>
                );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800">No Articles Yet</h2>
            <p className="mt-2 text-gray-600">Check back soon for articles about {sport.name}!</p>
          </div>
        )}
      </div>
    </main>
  );
}

// For pre-rendering paths at build time
// export async function generateStaticParams() {
//   const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
//   if (!strapiUrl) return [];
//   const res = await fetch(`${strapiUrl}/sports?fields[0]=slug`); // Only fetch slugs
//   if (!res.ok) return [];
//   const sportsResponse = await res.json();
//   if (!sportsResponse || !Array.isArray(sportsResponse.data)) return [];
//   return sportsResponse.data.map((sport: { slug: string }) => ({
//     sport_slug: sport.slug,
//   }));
// }