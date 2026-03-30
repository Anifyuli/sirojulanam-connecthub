export interface CreateQuoteDto {
  categoryId?: number | null;
  title: string;
  adminId: number;
  content: string;
  source?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export interface UpdateQuoteDto {
  categoryId?: number | null;
  title?: string;
  content?: string;
  source?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export interface QuoteFilter {
  categoryId?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  tag?: string;
  adminId?: number;
}

export interface QuoteResponse {
  id: number;
  title: string | undefined;
  categoryId: number | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  adminId: number;
  admin?: {
    id: number;
    name: string;
    username: string;
  };
  content: string;
  source: string;
  isPublished: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuoteCategoryDto {
  name: string;
  slug: string;
  colorHex?: string;
}

export interface QuoteCategoryResponse {
  id: number;
  name: string;
  slug: string;
  colorHex: string;
  createdAt: Date;
}