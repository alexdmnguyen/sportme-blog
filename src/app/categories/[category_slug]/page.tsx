// Single Category Pages

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import { getArticlesByCategorySlug, getStrapiImageUrl } from '@/lib/strapi-client';
import { 
  StrapiCategoryPageData,
  StrapiArticleListItem,
  StrapiRelatedItem,
  DirectStrapiMediaObject
} from '@/lib/strapi-types';

// --- PROPS INTERFACE ---
interface CategoryPageProps {
  params: {
    category_slug: string;
  };
}

// --- METADATA FUNCTION ---
export async function generateMetadata(
  { params }: CategoryPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { category } = await getArticlesByCategorySlug(params.category_slug);
  if (!category) {
    return { title: 'Category Not Found' };
  }
  return {
    title: `${category.name} Articles | SamboBlog`,
    description: category.description || `Browse articles in the ${category.name} category.`,
  };
}

// --- PAGE COMPONENT ---
export const revalidate = 60; // Revalidate this page every 60 seconds

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category, articles }: StrapiCategoryPageData = await getArticlesByCategorySlug(params.category_slug);

  if (!category) {
    notFound();
  }

  // category_image
  // const fullCategoryImageUrl = getStrapiImageUrl(category.category_image); 

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:py-12">
      <div className="text-center mb-12">
        {/* Placeholder if categories had images 
        {fullCategoryImageUrl && (
          <img 
            src={fullCategoryImageUrl} 
            alt={category.name} 
            className="w-32 h-32 object-contain rounded-full mx-auto mb-4 shadow-md border-4 border-white dark:border-slate-700"
          />
        )}
        */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100">{category.name}</h1>
        {category.description && (
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{category.description}</p>
        )}
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {articles.map((article) => {
            const fullArticleCoverUrl = getStrapiImageUrl(article.cover_image);
            const sportInfo = article.sport;

            return (
              <div key={article.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-xl hover:shadow-2xl dark:border dark:border-slate-700 transition-all duration-300 ease-in-out flex flex-col overflow-hidden transform hover:-translate-y-1">
                {fullArticleCoverUrl && (
                   <Link href={`/articles/${article.slug}`} className="block aspect-video overflow-hidden">
                    <img 
                      src={fullArticleCoverUrl} 
                      alt={article.cover_image?.alternativeText || article.title || ''}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                    <Link href={`/articles/${article.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {article.title || 'Untitled Article'}
                    </Link>
                  </h2>
                  {/* Display Sport if available */}
                  {sportInfo && sportInfo.slug && (
                     <p className="text-xs text-indigo-500 dark:text-indigo-400 mb-2 font-medium">
                       <Link href={`/sports/${sportInfo.slug}`} className="hover:underline">
                         {sportInfo.name}
                       </Link>
                     </p>
                   )}
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
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">No Articles Yet</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Check back soon for articles in the {category.name} category!</p>
        </div>
      )}
    </main>
  );
}

// Optional: For pre-rendering paths at build time
// export async function generateStaticParams() {
//   // You would fetch all category slugs from Strapi here
//   // const categories = await getCategoriesFromStrapi(); // Assuming getCategoriesFromStrapi fetches all
//   // return categories.map((category) => ({
//   //   category_slug: category.slug,
//   // }));
// }
