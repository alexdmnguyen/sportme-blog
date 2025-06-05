// Single Article Pages

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import { getArticleBySlug, getStrapiImageUrl } from '@/lib/strapi-client';
import { 
  StrapiArticle, 
  StrapiRelatedItem,
  DirectStrapiMediaObject
} from '@/lib/strapi-types';

function renderRichTextBlock(block: any, index: number) {
  switch (block.type) {
    case 'paragraph':
      return <p key={index} className="mb-4 leading-relaxed">{block.children.map((child: any, i: number) => <span key={i}>{child.text}</span>)}</p>;
    case 'heading':
      const Tag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      return <Tag key={index} className={`font-bold mt-6 mb-3 ${block.level === 1 ? 'text-3xl' : block.level === 2 ? 'text-2xl' : 'text-xl'}`}>{block.children.map((child: any, i: number) => <span key={i}>{child.text}</span>)}</Tag>;
    case 'list':
      const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag key={index} className={`ml-6 mb-4 ${block.format === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
          {block.children.map((listItem: any, listItemIndex: number) => (
            <li key={listItemIndex} className="mb-1">
              {listItem.children.map((child: any, textIndex: number) => <span key={textIndex}>{child.text}</span>)}
            </li>
          ))}
        </ListTag>
      );
    case 'quote':
        return <blockquote key={index} className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-4 text-slate-600 dark:text-slate-400">{block.children.map((child: any, i: number) => <span key={i}>{child.text}</span>)}</blockquote>;
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
  const article: StrapiArticle | null = await getArticleBySlug(params.slug);
  if (!article) {
    return { title: 'Article Not Found' };
  }

  const fullOpenGraphImageUrl = getStrapiImageUrl(article.cover_image);

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
export const revalidate = 60; // Revalidate this page every 60 seconds

export default async function SingleArticlePage({ params }: SingleArticlePageProps) {
  const article: StrapiArticle | null = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const fullCoverImageUrl = getStrapiImageUrl(article.cover_image);
  
  const sportData = article.sport; 
  const categoriesData = article.categories;

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:py-12">
      <article className="max-w-3xl mx-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-8 lg:p-10">
        {/* Display Sport and Categories */}
        <div className="mb-6 flex flex-wrap items-center text-sm gap-x-4 gap-y-2">
          {sportData && sportData.slug && (
            <Link href={`/sports/${sportData.slug}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-slate-700 px-3 py-1 rounded-full">
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
                    className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-medium"
                  >
                    {category.name}
                  </Link>
                )
              ))}
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 text-slate-900 dark:text-slate-100">{article.title}</h1>

        {article.publishedAt && (
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Published: {new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        {fullCoverImageUrl && (
          <div className="mb-8 overflow-hidden rounded-lg shadow-md">
            <img
              src={fullCoverImageUrl}
              alt={article.cover_image?.alternativeText || article.title || 'Article cover image'}
              className="w-full h-100 object-cover"
              width={article.cover_image?.width || 800}
              height={article.cover_image?.height || 450}
            />
          </div>
        )}

        {article.ai_assisted && (
            <p className="my-6 p-3 bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600 rounded-md text-sm">
                ℹ️ This article was written with AI assistance.
            </p>
        )}

        <div className="prose prose-slate lg:prose-xl max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-700 dark:prose-a:text-indigo-400 dark:hover:prose-a:text-indigo-300">
          {Array.isArray(article.main_content) && article.main_content.length > 0 ?
            article.main_content.map((block, index) => renderRichTextBlock(block, index))
            : <p className="text-slate-500 dark:text-slate-400">No content available for this article.</p>}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link href="/articles" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline">
            &larr; Back to All Articles
          </Link>
        </div>
      </article>
    </main>
  );
}
