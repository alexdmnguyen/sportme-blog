// Represents the structure of different image sizes from Strapi's media library
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

// Represents a populated media object (cover_image, sport_image)
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

// Represents a populated related item (Sport, Category)
// when fetched as part of another content type (sport linked to an article).
export interface StrapiRelatedItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sport_image?: DirectStrapiMediaObject | null;
  categories?: Array<{ id: number; name: string; slug: string; }>;
  // category_image?: DirectStrapiMediaObject | null;
}


// For fetching a list of sports or categories directly
export interface StrapiSportListItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sport_image?: DirectStrapiMediaObject | null;
}

export interface StrapiCategoryListItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  // category_image?: DirectStrapiMediaObject | null;
}

// A full Article object with all relations populated
export interface StrapiArticle {
  id: number;
  title: string;
  slug: string | null;
  excerpt?: string | null;
  main_content?: Array<{ 
    type: string; 
    children: Array<{ type: string; text: string }>; 
    level?: number; 
    format?: string;
  }>;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  ai_assisted?: boolean;
  cover_image?: DirectStrapiMediaObject | null;
  
  sport?: StrapiRelatedItem | null;
  categories?: StrapiRelatedItem[];
}

// For simplified article listings
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

// For the dynamic sport page data structure
export interface StrapiSportPageData {
  sport: StrapiRelatedItem | null;
  articles: StrapiArticleListItem[];
}

// For the dynamic category page data structure
export interface StrapiCategoryPageData {
  category: StrapiRelatedItem | null;
  articles: StrapiArticleListItem[];
}
