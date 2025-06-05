import Link from 'next/link';

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

async function getStrapiArticles(): Promise<StrapiArticle[]> {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  if (!strapiUrl) {
    console.error("Strapi URL is not defined in environment variables (ArticlesPage).");
    return [];
  }
  const endpoint = `${strapiUrl}/articles?populate=*&sort[0]=publishedAt:desc`; // Sort by newest
  // console.log(`Fetching Strapi articles from (ArticlesPage): ${endpoint}`);

  try {
    const res = await fetch(endpoint, {
      headers: { ...(strapiToken && { 'Authorization': `Bearer ${strapiToken}` }) },
      // cache: 'no-store', // Consider cache strategy for production
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to fetch Strapi articles (ArticlesPage server response not OK):', res.status, errorText);
      return [];
    }
    const jsonResponse = await res.json();
    // console.log('Strapi Raw API Response (ArticlesPage):', JSON.stringify(jsonResponse, null, 2));

    if (jsonResponse && Array.isArray(jsonResponse.data)) {
      const validArticles = jsonResponse.data.filter(
        (item: any) => item && typeof item.title !== 'undefined' && item.slug
      );
      if (validArticles.length !== jsonResponse.data.length) {
        // console.warn('Some Strapi articles were filtered out (ArticlesPage - missing title or slug). Original data:', jsonResponse.data);
      }
      return validArticles as StrapiArticle[];
    } else {
      console.error('Strapi response data not as expected (ArticlesPage):', jsonResponse);
      return [];
    }
  } catch (error) {
    console.error('Error fetching Strapi articles (ArticlesPage catch):', error);
    return [];
  }
}

export const revalidate = 60; // Revalidate this page every 60 seconds

export default async function ArticlesPage() {
  const articles = await getStrapiArticles();

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 sm:mb-12 text-center text-gray-800">All Articles</h1>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.map((article) => (
            <div key={article.id} className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">{article.title || 'Untitled Article'}</h2>
              {/* <p className="text-xs text-gray-500 mb-1">Slug: {article.slug}</p> */}
              {article.publishedAt && (
                <p className="text-xs text-gray-500 mb-3">
                  Published: {new Date(article.publishedAt).toLocaleDateString()}
                </p>
              )}
              {article.excerpt && <p className="text-gray-700 mb-4 flex-grow">{article.excerpt}</p>}
              {!article.excerpt && <div className="flex-grow"></div>} {/* Pushes link to bottom if no excerpt */}
              {article.slug ? (
                <Link href={`/articles/${article.slug}`} className="mt-auto inline-block bg-indigo-600 text-white font-semibold py-2 px-4 rounded hover:bg-indigo-700 transition-colors self-start">
                    Read more
                </Link>
              ) : (
                <p className="mt-auto text-sm text-red-500">Article slug missing, cannot link.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 text-xl">No articles found. Check back later!</p>
      )}
    </main>
  );
}