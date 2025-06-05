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

interface StrapiRelatedSportForArticle {
  id: number;
  name: string;
  slug: string;
}

interface StrapiArticleListItemForCategoryPage {
  id: number;
  title: string;
  slug: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  cover_image?: DirectStrapiMediaObject | null;
  sport?: { data?: StrapiRelatedSportForArticle | null };
}

interface StrapiCategoryDetails {
  id: number;
  name: string;
  slug: string;
  description?: string;
  // Add 'category_image?: DirectStrapiMediaObject | null;' if your Category CT has an image
}

interface CategoryPageData {
  category: StrapiCategoryDetails | null;
  articles: StrapiArticleListItemForCategoryPage[];
}

// --- DATA FETCHING FUNCTION ---
async function getCategoryDetailsAndArticles(categorySlug: string): Promise<CategoryPageData> {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  let categoryData: StrapiCategoryDetails | null = null;
  let articlesData: StrapiArticleListItemForCategoryPage[] = [];

  if (!strapiUrl) {
    console.error("Strapi URL is not defined (getCategoryDetailsAndArticles).");
    return { category: null, articles: [] };
  }

  console.log(`DEBUG (Server Console) - getCategoryDetailsAndArticles received categorySlug: "${categorySlug}"`);

  try {
    const categoryEndpoint = `${strapiUrl}/categories?filters[slug][$eq]=${categorySlug}`;
    console.log(`DEBUG (Server Console) - Fetching Category Details from: ${categoryEndpoint}`);
    
    const categoryRes = await fetch(categoryEndpoint, { headers: { ...(strapiToken && { Authorization: `Bearer ${strapiToken}` }) }, cache: 'no-store' });
    const categoryResText = await categoryRes.text();

    if (categoryRes.ok) {
      const categoryJsonResponse = JSON.parse(categoryResText);
      console.log(`DEBUG (Server Console) - Category Details JSON Response for slug "${categorySlug}":`, JSON.stringify(categoryJsonResponse, null, 2));
      if (categoryJsonResponse && Array.isArray(categoryJsonResponse.data) && categoryJsonResponse.data.length > 0) {
        // Assuming category data is flat or access .attributes if necessary
        categoryData = categoryJsonResponse.data[0] as StrapiCategoryDetails;
      } else {
        console.warn(`DEBUG (Server Console) - No category found for slug "${categorySlug}" in categoryJsonResponse.data`);
      }
    } else {
      console.error(`DEBUG: Failed to fetch category details for ${categorySlug}:`, categoryRes.status, categoryResText);
    }

    if (categoryData) {
      const articlesPopulate = [
        'populate[cover_image][fields][0]=url',
        'populate[cover_image][fields][1]=alternativeText',
        'populate[cover_image][fields][2]=width',
        'populate[cover_image][fields][3]=height',
        'populate[sport][fields][0]=name',
        'populate[sport][fields][1]=slug'
      ].join('&');
      
      const articlesEndpoint = `${strapiUrl}/articles?filters[categories][slug][$eq]=${categorySlug}&${articlesPopulate}&sort[0]=publishedAt:desc`;
      console.log(`DEBUG (Server Console) - Fetching Articles for Category "${categorySlug}" from: ${articlesEndpoint}`);

      const articlesRes = await fetch(articlesEndpoint, { headers: { ...(strapiToken && { Authorization: `Bearer ${strapiToken}` }) }, cache: 'no-store' });
      const articlesResText = await articlesRes.text();

      if (articlesRes.ok) {
        const articlesJsonResponse = JSON.parse(articlesResText);
        console.log(`DEBUG (Server Console) - Articles for Category "${categorySlug}" JSON Response:`, JSON.stringify(articlesJsonResponse, null, 2));
        if (articlesJsonResponse && Array.isArray(articlesJsonResponse.data)) {
          articlesData = articlesJsonResponse.data.filter(
            (item: any) => item && typeof item.title !== 'undefined' && item.slug
          ) as StrapiArticleListItemForCategoryPage[];
        } else {
          console.warn(`DEBUG (Server Console) - No articles found for category "${categorySlug}" or data format unexpected.`);
        }
      } else {
        console.error(`DEBUG: Failed to fetch articles for category ${categorySlug}:`, articlesRes.status, articlesResText);
      }
    } else {
        console.warn(`DEBUG (Server Console) - Skipping fetching articles because categoryData for slug "${categorySlug}" was not found or is null.`);
    }
    
  } catch (error: any) {
    console.error(`DEBUG: Error in getCategoryDetailsAndArticles for ${categorySlug} (outer catch block):`, error.message, error.stack);
  }
  
  return { category: categoryData, articles: articlesData };
}

// --- PROPS INTERFACE ---
interface CategoryPageProps {
  params: {
    category_slug: string; // Matches the folder name [category_slug]
  };
}

// --- METADATA FUNCTION ---
export async function generateMetadata(
  { params }: CategoryPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { category } = await getCategoryDetailsAndArticles(params.category_slug);
  if (!category) {
    return { title: 'Category Not Found' };
  }
  return {
    title: `${category.name} Articles | SportsBlogPro`,
    description: category.description || `Browse articles in the ${category.name} category.`,
  };
}

// --- PAGE COMPONENT ---
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category, articles } = await getCategoryDetailsAndArticles(params.category_slug);
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || '';

  if (!category) {
    notFound(); // Triggers 404 page
  }

  // 'category_image'
  // const categoryImageUrl = category.category_image?.url; 
  // const fullCategoryImageUrl = categoryImageUrl
  //   ? (categoryImageUrl.startsWith('/') ? `${strapiBaseUrl}${categoryImageUrl}` : categoryImageUrl)
  //   : null;

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        {/* Placeholder for category image if you add one */}
        {/* {fullCategoryImageUrl && (
          <img src={fullCategoryImageUrl} alt={category.name} className="w-40 h-40 object-contain rounded-full mx-auto mb-4 shadow-md border-4 border-white"/>
        )} */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">{category.description}</p>
        )}
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.map((article) => {
            const articleCoverImageUrlFromAPI = article.cover_image?.url;
            const fullArticleCoverUrl = articleCoverImageUrlFromAPI
              ? (articleCoverImageUrlFromAPI.startsWith('/') ? `${strapiBaseUrl}${articleCoverImageUrlFromAPI}` : articleCoverImageUrlFromAPI)
              : null;
            
            const sportInfo = article.sport?.data;

            return (
              <div key={article.id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                {fullArticleCoverUrl && (
                   <Link href={`/articles/${article.slug}`} className="block mb-4 rounded-md overflow-hidden">
                    <img 
                      src={fullArticleCoverUrl} 
                      alt={article.cover_image?.alternativeText || article.title}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                      width={article.cover_image?.width || 400}
                      height={article.cover_image?.height || 225}
                    />
                  </Link>
                )}
                <h2 className="text-xl font-bold mb-2 text-gray-900">
                  <Link href={`/articles/${article.slug}`} className="hover:text-indigo-700 transition-colors">
                    {article.title || 'Untitled Article'}
                  </Link>
                </h2>
                {sportInfo && sportInfo.slug && (
                  <p className="text-xs text-indigo-600 mb-1">
                    <Link href={`/sports/${sportInfo.slug}`} className="hover:underline">
                      {sportInfo.name}
                    </Link>
                  </p>
                )}
                {article.publishedAt && (
                  <p className="text-xs text-gray-500 mb-3">
                    Published: {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                )}
                {article.excerpt && <p className="text-gray-700 text-sm mb-4 flex-grow">{article.excerpt}</p>}
                {!article.excerpt && <div className="flex-grow"></div>} {/* Pushes link to bottom */}
                <div className="mt-auto">
                  <Link href={`/articles/${article.slug}`} className="inline-block text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                    Read more &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-600 text-xl">No articles found for {category.name} yet.</p>
      )}
    </main>
  );
}

// Optional: For pre-rendering paths at build time
// export async function generateStaticParams() {
//   const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
//   if (!strapiUrl) return [];
//   const res = await fetch(`${strapiUrl}/categories?fields[0]=slug`); // Only fetch slugs
//   if (!res.ok) return [];
//   const categoriesResponse = await res.json();
//   if (!categoriesResponse || !Array.isArray(categoriesResponse.data)) return [];
//   return categoriesResponse.data.map((category: { slug: string }) => ({
//     category_slug: category.slug, // Must match the dynamic segment name [category_slug]
//   }));
// }