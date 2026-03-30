export interface CreateFigureDto {
  adminId: number;
  name: string;
  title: string;
  bio?: string;
  imageUrl?: string;
  birthYear?: string;
  deathYear?: string;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface UpdateFigureDto {
  name: string;
  title?: string;
  bio?: string;
  imageUrl?: string;
  birthYear?: string;
  deathYear?: string;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface FigureFilter {
  isPublished?: boolean;
  isFeatured?: boolean;
  tag?: string;
  adminId?: number;
}

export interface FigureResponse {
  id: number;
  adminId: number;
  admin?: {
    id: number;
    name: string;
    username: string;
  };
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  birthYear: string;
  deathYear: string;
  tags?: string[];
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}