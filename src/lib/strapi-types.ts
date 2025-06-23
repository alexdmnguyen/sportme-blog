export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

export interface StrapiResponse<T> {
  data: StrapiEntity<T> | StrapiEntity<T>[] | null;
  meta?: {
    pagination: StrapiPagination;
  };
}

export type NormalizedStrapiResponse<T> = (T & { id: number })[] | (T & { id: number }) | null;


// --- Media & Images ---
export interface StrapiMediaFormat {
  url: string;
  name?: string;
  hash?: string;
  ext?: string;
  mime?: string;
  path?: string | null;
  width?: number;
  height?: number;
  size?: number;
  sizeInBytes?: number;
}

export interface DirectStrapiMediaObject {
  id: number;
  name?: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
    [key: string]: StrapiMediaFormat | undefined;
  };
  ext?: string;
  mime?: string;
  size?: number;
}

// --- Content-Specific Types ---

export interface StrapiRelatedItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sport_image?: DirectStrapiMediaObject | null;
  categories?: Array<{ id: number; name: string; slug: string; }>;
  category_image?: DirectStrapiMediaObject | null;
  is_esport?: boolean;
}

export interface StrapiSportListItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_esport: boolean;
  sport_image?: DirectStrapiMediaObject | null;
}

export interface StrapiCategoryListItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface StrapiArticleListItem {
  id: number;
  title: string;
  slug: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  cover_image?: DirectStrapiMediaObject | null;
  sport?: Pick<StrapiRelatedItem, 'id' | 'name' | 'slug'> | null; 
  categories?: Array<Pick<StrapiRelatedItem, 'id' | 'name' | 'slug'>>;
}

export interface StrapiArticle {
  id: number;
  title: string;
  slug: string | null;
  excerpt?: string | null;
  main_content?: any[];
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  ai_assisted?: boolean;
  cover_image?: DirectStrapiMediaObject | null;
  sport?: StrapiRelatedItem | null;
  categories?: StrapiRelatedItem[];
}

export interface StrapiSportPageData {
  sport: StrapiRelatedItem | null;
  articles: StrapiArticleListItem[];
}

export interface StrapiCategoryPageData {
  category: StrapiRelatedItem | null;
  articles: StrapiArticleListItem[];
}