import { VideosSourceType } from "../entities/Videos.ts";

export interface CreateVideoDto {
  categoryId?: number | null;
  adminId: number;
  title: string;
  slug: string;
  description?: string;
  sourceType: VideosSourceType;
  sourceUrl?: string;
  platformVideoId?: string;
  localFileUrl?: string;
  durationSeconds?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  publishedAt?: Date;
  tags?: string[];
}

export interface UpdateVideoDto {
  categoryId?: number | null;
  title?: string;
  slug?: string;
  description?: string;
  sourceType?: VideosSourceType;
  sourceUrl?: string;
  platformVideoId?: string;
  localFileUrl?: string;
  durationSeconds?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  publishedAt?: Date;
  tags?: string[];
}

export interface VideoFilter {
  title?: string;
  categoryId?: number;
  adminId?: number;
  slug?: string;
  sourceType?: VideosSourceType;
  isPublished?: boolean;
}

export interface VideoResponse {
  id: number;
  adminId: number;
  categoryId: number | null;
  title: string;
  slug: string;
  description?: string;
  sourceType: VideosSourceType;
  sourceUrl?: string;
  platformVideoId?: string;
  localFileUrl?: string;
  durationSeconds?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  publishedAt?: Date;
  viewCount?: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
