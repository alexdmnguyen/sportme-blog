// All eSports Articles Page

import Link from 'next/link';
import Image from 'next/image';
import { getAllArticles, getStrapiImageUrl } from '@/lib/strapi-client';
import { StrapiArticleListItem } from '@/lib/strapi-types';

export const revalidate = 60;

export default async function EsportsArticlesPage({ searchParams }: { searchParams?: { page?: string } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = 9;
  
  const { articles, pagination } = await getAllArticles(currentPage, pageSize, { is_esport: true });

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:py-12">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 sm:mb-14 text-center text-slate-900 dark:text-slate-100">All eSports Articles</h1>
      
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const fullCoverUrl = getStrapiImageUrl(article.cover_image);
              return (
                <div key={article.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-xl hover:shadow-2xl dark:border dark:border-slate-700 transition-all duration-300 ease-in-out flex flex-col overflow-hidden transform hover:-translate-y-1 group">
                  {fullCoverUrl && (
                    <Link href={`/articles/${article.slug}`} className="block aspect-video overflow-hidden relative">
                      <Image 
                        src={fullCoverUrl} 
                        alt={article.cover_image?.alternativeText || article.title}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </Link>
                  )}
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                      <Link href={`/articles/${article.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {article.title || 'Untitled Article'}
                      </Link>
                    </h2>
                    {article.publishedAt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Published: {new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                    {article.excerpt && (
                      <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base mb-4 flex-grow line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    {!article.excerpt && <div className="flex-grow min-h-[3em]"></div>}
                    
                    <div className="mt-auto pt-2">
                        <Link href={`/articles/${article.slug}`} className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                            Read more &rarr;
                        </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && pagination.pageCount > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
              {currentPage > 1 && (
                <Link href={`/articles/esports?page=${currentPage - 1}`} className="w-full sm:w-auto text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  &larr; Previous
                </Link>
              )}
              <span className="text-slate-700 dark:text-slate-300">
                Page {currentPage} of {pagination.pageCount}
              </span>
              {currentPage < pagination.pageCount && (
                <Link href={`/articles/esports?page=${currentPage + 1}`} className="w-full sm:w-auto text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Next &rarr;
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-slate-600 dark:text-slate-400 text-xl py-10">No eSports articles found. Check back later!</p>
      )}
    </main>
  );
}