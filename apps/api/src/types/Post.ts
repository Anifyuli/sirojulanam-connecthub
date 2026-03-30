import { PostType } from '../entities/Posts.ts';

export interface CreatePostDto {
  adminId: number;
  type: PostType;
  title: string;
  content: string;
  quoteId?: number | null;
  figureId?: number | null;
  isPublished?: boolean;
  tags?: string[];
}

export interface UpdatePostDto {
  type?: PostType;
  title?: string;
  content?: string;
  quoteId?: number | null;
  figureId?: number | null;
  isPublished?: boolean;
  tags?: string[];
}

export interface PostFilter {
  type?: PostType;
  isPublished?: boolean;
  adminId?: number;
}

export interface PostResponse {
  id: number;
  adminId: number;
  admin?: {
    id: number;
    name: string;
    username: string;
  };
  type: PostType;
  title: string;
  content: string;
  quoteId?: number | null;
  quote?: {
    id: number;
    content: string;
    source: string;
  };
  figureId?: number | null;
  figure?: {
    id: number;
    name: string;
    title: string;
    imageUrl: string;
  };
  isPublished: boolean;
  viewCount: number;
  reactions: ReactionSummary[];
  reactionCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReactionSummary {
  reactionType: string;
  count: number;
}

export interface AddReactionDto {
  adminId: number;
  reactionType: string;
}