export interface CreateBlogPostDto {
  categoryId?: number | null;
  adminId: number;
  title: string;
  slug: string;
  excerpt?: string;
  contentMd: string;
  coverImageUrl?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  publishedAt?: Date;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateBlogPostDto {
  categoryId?: number | null;
  title: string;
  slug: string;
  excerpt?: string;
  contentMd: string;
  coverImageUrl?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  publishedAt?: Date;
  metaTitle?: string;
  metaDescription?: string;
}

export interface BlogTagDto {
  tags: string[];
}

export interface BlogPostFilter {
  title?: string;
  categoryId?: number;
  adminId?: number;
  slug?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface BlogPostResponse {
  id: number;
  categoryId: number | null;
  adminId: number;
  title: string;
  slug: string;
  excerpt: string;
  contentMd: string;
  coverImageUrl: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  publishedAt: Date;
  viewCount?: number;
  metaTitle: string;
  metaDescription: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
