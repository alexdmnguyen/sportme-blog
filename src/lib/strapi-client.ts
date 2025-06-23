import qs from "qs";
import { 
  StrapiArticle, 
  StrapiSportListItem,
  StrapiCategoryListItem,
  StrapiArticleListItem,
  StrapiRelatedItem,
  StrapiPagination,
  DirectStrapiMediaObject
} from "@/lib/strapi-types";

// --- HELPER FUNCTIONS ---

export function getStrapiImageUrl(mediaObject?: DirectStrapiMediaObject | null): string | null {
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;
  if (!strapiBaseUrl) {
    console.error("NEXT_PUBLIC_STRAPI_BASE_URL environment variable is not set.");
    return null;
  }

  const imageUrlFromAPI = mediaObject?.url;
  if (imageUrlFromAPI) {
    return imageUrlFromAPI.startsWith('http') || imageUrlFromAPI.startsWith('//')
      ? imageUrlFromAPI
      : `${strapiBaseUrl}${imageUrlFromAPI.startsWith('/') ? '' : '/'}${imageUrlFromAPI}`;
  }
  return null;
}

async function fetchStrapiAPI(
  path: string, 
  urlParamsObject: Record<string, unknown> = {}, 
  options: RequestInit = {}
) {
  const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  if (!strapiApiUrl) {
    console.error("NEXT_PUBLIC_STRAPI_API_URL environment variable is not set. Cannot fetch data.");
    throw new Error("API URL is not configured. Please set NEXT_PUBLIC_STRAPI_API_URL.");
  }

  try {
    const defaultOptions: RequestInit = {
      headers: { 'Content-Type': 'application/json', ...(strapiToken && { 'Authorization': `Bearer ${strapiToken}` }) },
      cache: 'force-cache', 
      ...options,
    };
    const queryString = qs.stringify(urlParamsObject, { encodeValuesOnly: true });
    const requestUrl = `${strapiApiUrl}${path}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(requestUrl, defaultOptions);
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("Strapi API Error:", response.status, responseText);
      throw new Error(`Failed to fetch from Strapi: ${response.status} ${response.statusText} - ${responseText}`);
    }
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error in fetchStrapiAPI:", error);
    throw error; 
  }
}

function normalizeStrapiResponse(apiResponse: unknown): unknown {
  if (!apiResponse || typeof apiResponse !== 'object') return null;

  if ('data' in apiResponse) {
    const data = (apiResponse as { data: unknown }).data;
    
    if (!data) return null;

    if (Array.isArray(data)) {
      return data.map((item: unknown) => {
        if (item && typeof item === 'object' && 'id' in item && 'attributes' in item) {
          return { id: item.id as number, ...(item.attributes as object) };
        }
        return item;
      });
    }

    if (typeof data === 'object' && 'id' in data && 'attributes' in data) {
      return { id: data.id as number, ...(data.attributes as object) };
    }
    return data;
  }
  return apiResponse; 
}


// --- CORE DATA FETCHING FUNCTIONS ---

export async function getSportsFromStrapi(options?: { is_esport?: boolean }): Promise<StrapiSportListItem[]> {
  const urlParams: Record<string, unknown> = {
    populate: { sport_image: { fields: ['name', 'alternativeText', 'url', 'width', 'height', 'formats'] } },
    sort: { name: 'asc' },
  };
  if (typeof options?.is_esport === 'boolean') {
    urlParams.filters = { is_esport: { $eq: options.is_esport } };
  }
  try {
    const response = await fetchStrapiAPI("/sports", urlParams);
    return (normalizeStrapiResponse(response) as StrapiSportListItem[]) || [];
  } catch (error) {
    console.error("getSportsFromStrapi failed:", error);
    return [];
  }
}

export async function getCategoriesFromStrapi(): Promise<StrapiCategoryListItem[]> {
  const urlParams = { fields: ['name', 'slug', 'description'], sort: { name: 'asc' } };
  try {
    const response = await fetchStrapiAPI("/categories", urlParams);
    return (normalizeStrapiResponse(response) as StrapiCategoryListItem[]) || [];
  } catch (error) {
    console.error("getCategoriesFromStrapi failed:", error);
    return [];
  }
}

export async function getLatestArticles(limit: number = 5, options?: { is_esport?: boolean }): Promise<StrapiArticleListItem[]> {
  const urlParams: Record<string, unknown> = {
    fields: ['title', 'slug', 'excerpt', 'publishedAt'],
    populate: { cover_image: { fields: ['url', 'alternativeText', 'width', 'height'] } },
    sort: { publishedAt: 'desc' },
    pagination: { limit },
  };
  if (typeof options?.is_esport === 'boolean') {
    urlParams.filters = { sport: { is_esport: { $eq: options.is_esport } } };
  }
  try {
    const response = await fetchStrapiAPI("/articles", urlParams);
    return (normalizeStrapiResponse(response) as StrapiArticleListItem[]) || [];
  } catch (error) {
    console.error("getLatestArticles failed:", error);
    return [];
  }
}

interface ArticleFilters { is_esport?: boolean; }

export async function getAllArticles(page: number = 1, pageSize: number = 25, filters?: ArticleFilters): Promise<{ articles: StrapiArticleListItem[], pagination: StrapiPagination | null }> {
  const urlParams = {
    fields: ['title', 'slug', 'excerpt', 'publishedAt'],
    populate: { cover_image: { fields: ['url', 'alternativeText', 'width', 'height'] } },
    sort: { publishedAt: 'desc' },
    pagination: { page, pageSize, withCount: true },
    ...(filters && filters.is_esport !== undefined && {
      filters: { sport: { is_esport: { $eq: filters.is_esport } } }
    })
  };
  try {
    const response = await fetchStrapiAPI("/articles", urlParams);
    return { 
      articles: (normalizeStrapiResponse(response) as StrapiArticleListItem[]) || [], 
      pagination: (response as { meta?: { pagination: StrapiPagination | null } }).meta?.pagination || null 
    };
  } catch (error) {
    console.error("getAllArticles failed:", error);
    return { articles: [], pagination: null };
  }
}

export async function getArticleBySlug(slug: string): Promise<StrapiArticle | null> {
  const urlParams = {
    filters: { slug: { $eq: slug } },
    populate: { 
      cover_image: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
      sport: { populate: { sport_image: { fields: ['name', 'alternativeText', 'url', 'width', 'height', 'formats'] } } },
      categories: { fields: ['name', 'slug'] }
    }
  };
  try {
    const response = await fetchStrapiAPI("/articles", urlParams);
    const articles = normalizeStrapiResponse(response) as StrapiArticle[];
    return articles && articles.length > 0 ? articles[0] : null;
  } catch (error) {
    console.error(`getArticleBySlug for ${slug} failed:`, error);
    return null;
  }
}

export async function getArticlesBySportSlug(sportSlug: string): Promise<{ sport: StrapiRelatedItem | null, articles: StrapiArticleListItem[] }> {
  let sport: StrapiRelatedItem | null = null;
  let articles: StrapiArticleListItem[] = [];
  try {
    const sportResponse = await fetchStrapiAPI("/sports", {
      filters: { slug: { $eq: sportSlug } },
      populate: { sport_image: { fields: ['name', 'alternativeText', 'url', 'width', 'height'] }, categories: { fields: ['name', 'slug'] } }
    });
    const sports = normalizeStrapiResponse(sportResponse) as StrapiRelatedItem[];
    if (sports && sports.length > 0) {
      sport = sports[0];
      const articlesResponse = await fetchStrapiAPI("/articles", {
        filters: { sport: { slug: { $eq: sportSlug } } },
        populate: { cover_image: { fields: ['url', 'alternativeText', 'width', 'height'] }, categories: { fields: ['name', 'slug'] } },
        sort: { publishedAt: 'desc' }
      });
      articles = (normalizeStrapiResponse(articlesResponse) as StrapiArticleListItem[]) || [];
    }
  } catch (error) { console.error(`getArticlesBySportSlug for ${sportSlug} failed:`, error); }
  return { sport, articles };
}

export async function getArticlesByCategorySlug(categorySlug: string): Promise<{ category: StrapiRelatedItem | null, articles: StrapiArticleListItem[] }> {
  let category: StrapiRelatedItem | null = null;
  let articles: StrapiArticleListItem[] = [];
  try {
    const categoryResponse = await fetchStrapiAPI("/categories", {
      filters: { slug: { $eq: categorySlug } },
      fields: ['name', 'slug', 'description']
    });
    const categories = normalizeStrapiResponse(categoryResponse) as StrapiRelatedItem[];
    if (categories && categories.length > 0) {
      category = categories[0];
      const articlesResponse = await fetchStrapiAPI("/articles", {
        filters: { categories: { slug: { $eq: categorySlug } } },
        populate: { cover_image: { fields: ['url', 'alternativeText', 'width', 'height'] }, sport: { fields: ['name', 'slug'] } },
        sort: { publishedAt: 'desc' }
      });
      articles = (normalizeStrapiResponse(articlesResponse) as StrapiArticleListItem[]) || [];
    }
  } catch (error) { console.error(`getArticlesByCategorySlug for ${categorySlug} failed:`, error); }
  return { category, articles };
}

export async function getSportAndCategoryPageData(sportSlug: string, categorySlug: string): Promise<{ sport: StrapiRelatedItem | null, articles: StrapiArticleListItem[] }> {
  let sport: StrapiRelatedItem | null = null;
  let articles: StrapiArticleListItem[] = [];
  try {
    const sportResponse = await fetchStrapiAPI("/sports", {
      filters: { slug: { $eq: sportSlug } },
      populate: { sport_image: { fields: ['name', 'alternativeText', 'url', 'width', 'height'] }, categories: { fields: ['id', 'name', 'slug'] } }
    });
    const sports = normalizeStrapiResponse(sportResponse) as StrapiRelatedItem[];
    if (sports && sports.length > 0) {
      sport = sports[0];
      const articlesResponse = await fetchStrapiAPI("/articles", {
        filters: { $and: [{ sport: { slug: { $eq: sportSlug } } }, { categories: { slug: { $eq: categorySlug } } }] },
        populate: { cover_image: { fields: ['url', 'alternativeText', 'width', 'height'] } },
        sort: { publishedAt: 'desc' }
      });
      articles = (normalizeStrapiResponse(articlesResponse) as StrapiArticleListItem[]) || [];
    }
  } catch (error) { console.error(`getSportAndCategoryPageData for ${sportSlug}/${categorySlug} failed:`, error); }
  return { sport, articles };
}