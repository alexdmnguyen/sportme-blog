import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

// --- INTERFACES ---
interface StrapiMediaFormat {
  url: string;
}
interface StrapiMediaAttributes {
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
  };
}
interface StrapiMedia {
  data?: {
    id: number;
    attributes: StrapiMediaAttributes;
  } | null;
}
interface StrapiRelationItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  // cover_image?: StrapiMedia; // Renamed to sport_image for sport
  sport_image?: StrapiMedia;
}
interface StrapiMultiRelation { data?: StrapiRelationItem[]; }
interface StrapiSingleRelation { data?: StrapiRelationItem | null; }

interface DirectStrapiMediaObject {
    id: number;
    url: string;
    alternativeText?: string | null;
    width?: number;
    height?: number;
    formats?: { [key: string]: StrapiMediaFormat };
}

interface StrapiArticle {
  id: number;
  title: string;
  slug: string | null;
  excerpt?: string | null;
  main_content?: Array<{ type: string; children: Array<{ type: string; text: string }>; level?: number }>;
  publishedAt?: string | null;
  cover_image?: DirectStrapiMediaObject | null;
  ai_assisted?: boolean;
  sport?: StrapiSingleRelation;
  categories?: StrapiMultiRelation;
}

async function getStrapiArticleBySlug(slug: string): Promise<StrapiArticle | null> {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  if (!strapiUrl) {
    console.error("Strapi URL is not defined (getStrapiArticleBySlug).");
    return null;
  }

const populateParams = [
  'populate[sport][fields][0]=name',
  'populate[sport][fields][1]=slug',
  // 'populate[sport][populate][sport_image][fields][0]=url', 

  'populate[categories][fields][0]=name',
  'populate[categories][fields][1]=slug',

  'populate[cover_image][fields][0]=url',
  'populate[cover_image][fields][1]=alternativeText',
  'populate[cover_image][fields][2]=width',
  'populate[cover_image][fields][3]=height',
  'populate[cover_image][fields][4]=formats'

].join('&');
  
  const endpoint = `${strapiUrl}/articles?filters[slug][$eq]=${slug}&${populateParams}`;
  // console.log(`DEBUG: Fetching single Strapi article from: ${endpoint}`); // Keep this for debugging the URL

  try {
    const res = await fetch(endpoint, {
      headers: { ...(strapiToken && { 'Authorization': `Bearer ${strapiToken}` }) },
      cache: 'no-store', 
    });

    const responseTextForDebugging = await res.text(); 
    if (!res.ok) {
      console.error(`DEBUG: Failed to fetch article ${slug} (server response not OK):`, res.status, responseTextForDebugging);
      return null;
    }

    const jsonResponse = JSON.parse(responseTextForDebugging);
    // console.log(`DEBUG: Strapi Raw API Response for slug ${slug}:`, JSON.stringify(jsonResponse, null, 2)); 

    if (jsonResponse && Array.isArray(jsonResponse.data) && jsonResponse.data.length > 0) {
      const articleData = jsonResponse.data[0];
      if (articleData && typeof articleData.title !== 'undefined') {
        return articleData as StrapiArticle;
      } else {
        console.warn(`DEBUG: Article data for slug ${slug} might be missing title or is invalid.`, articleData);
        return null;
      }
    } else {
      console.warn(`DEBUG: No article found for slug ${slug} or data format unexpected. Response:`, jsonResponse);
      return null;
    }
  } catch (error: any) {
    console.error(`DEBUG: Error fetching article ${slug} (catch block):`, error.message, error.stack);
    return null;
  }
}


function renderRichTextBlock(block: any, index: number) {
  switch (block.type) {
    case 'paragraph':
      return <p key={index} className="mb-4 leading-relaxed">{block.children.map((child: any) => child.text).join('')}</p>;
    case 'heading':
      const Tag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      return <Tag key={index} className={`font-bold mt-6 mb-3 ${block.level === 1 ? 'text-3xl' : block.level === 2 ? 'text-2xl' : 'text-xl'}`}>{block.children.map((child: any) => child.text).join('')}</Tag>;
    case 'list':
      const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag key={index} className={`ml-6 mb-4 ${block.format === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
          {block.children.map((listItem: any, listItemIndex: number) => (
            <li key={listItemIndex} className="mb-1">
              {/* Assuming list item children are structured like paragraph children */}
              {listItem.children.map((child: any, textIndex: number) => <span key={textIndex}>{child.text}</span>).reduce((prev: any, curr: any) => [prev, '', curr] as any)}
            </li>
          ))}
        </ListTag>
      );
    case 'quote':
        return <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-4">{block.children.map((child: any) => child.text).join('')}</blockquote>;
    default:
      return <p key={index} className="my-2 p-2 bg-red-100 text-red-700 border border-red-300 rounded">Unsupported content block: {block.type}</p>;
  }
}

// --- PROPS INTERFACE ---
interface SingleArticlePageProps {
  params: {
    slug: string;
  };
}

// --- METADATA FUNCTION ---
export async function generateMetadata(
  { params }: SingleArticlePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const article = await getStrapiArticleBySlug(params.slug);
  if (!article) {
    return { title: 'Article Not Found' };
  }

  const coverImageUrlFromAPI = article.cover_image?.data?.attributes?.url;
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || '';
  const fullOpenGraphImageUrl = coverImageUrlFromAPI 
    ? (coverImageUrlFromAPI.startsWith('/') ? `${strapiBaseUrl}${coverImageUrlFromAPI}` : coverImageUrlFromAPI) 
    : null;

  return {
    title: article.title,
    description: article.excerpt || `Read more about ${article.title}`,
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      images: fullOpenGraphImageUrl ? [fullOpenGraphImageUrl] : [],
    },
  };
}

// --- PAGE COMPONENT ---
export default async function SingleArticlePage({ params }: SingleArticlePageProps) {
  const article = await getStrapiArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  // --- Image URL Construction ---
  const articleCoverImage = article.cover_image;
  // console.log("DEBUG (Browser Console): Article Cover Image Object from article:", articleCoverImage);

  const coverImageUrlFromAPI = articleCoverImage?.url;
  // console.log("DEBUG (Browser Console): Raw coverImageUrlFromAPI in Component:", coverImageUrlFromAPI);

  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || '';
  // console.log("DEBUG (Browser Console): Using strapiBaseUrl in Component:", strapiBaseUrl);

  const fullCoverImageUrl = coverImageUrlFromAPI
    ? (coverImageUrlFromAPI.startsWith('/') ? `${strapiBaseUrl}${coverImageUrlFromAPI}` : coverImageUrlFromAPI)
    : null;

  const sportData = article.sport;
  const categoriesData = article.categories;

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8 lg:p-10">
        {/* Display Sport and Categories */}
        <div className="mb-4 flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-2">
          {sportData && sportData.slug && (
            <Link href={`/sports/${sportData.slug}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
              {sportData.name}
            </Link>
          )}
          {categoriesData && categoriesData.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categoriesData.map(category => (
                category.slug && (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 text-xs font-medium"
                  >
                    {category.name}
                  </Link>
                )
              ))}
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 text-gray-900">{article.title}</h1>

        {article.publishedAt && (
          <p className="text-gray-500 mb-6 text-sm">
            Published: {new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        {/* Display cover image */}
        {fullCoverImageUrl ? (
          <div className="mb-8 overflow-hidden rounded-lg shadow-md">
            <img
              src={fullCoverImageUrl}
              alt={article.cover_image?.alternativeText || article.title}
              className="w-full h-auto object-cover"
              width={article.cover_image?.width || 800}
              height={article.cover_image?.height || 600}
            />
          </div>
        ) : (
          <div className="mb-8 text-center p-4 ">
            {/* Silent if no image, or <p className="text-gray-500 italic">No cover image available.</p> */}
          </div>
        )}

        {article.ai_assisted && (
            <p className="my-4 p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm">
                ℹ️ This article was written with AI assistance.
            </p>
        )}

        <div className="prose prose-slate lg:prose-xl max-w-none prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-800 text-gray-800">
          {Array.isArray(article.main_content) && article.main_content.length > 0 ?
            article.main_content.map((block, index) => renderRichTextBlock(block, index))
            : <p className="text-gray-500">No content available for this article.</p>}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link href="/articles" className="text-indigo-600 hover:text-indigo-800 hover:underline">
            &larr; Back to All Articles
          </Link>
        </div>
      </article>
    </main>
  );
}