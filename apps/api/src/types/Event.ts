export interface CreateEventDto {
  eventId?: number | null;
  categoryId: number | null;
  adminId: number;
  title: string;
  slug: string;
  descriptionMd?: unknown;
  locationName?: string;
  locationDetail?: string;
  startDatetime: Date;
  endDatetime: Date;
  isAllDay?: boolean;
  status: string;
  coverImageUrl?: string;
  isFree: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateEventDto {
  eventId?: number | null;
  categoryId?: number | null;
  adminId: number;
  title: string;
  slug: string;
  descriptionMd?: unknown;
  locationName?: string;
  locationDetail?: string;
  startDatetime: Date;
  endDatetime: Date;
  isAllDay?: boolean;
  status: string;
  coverImageUrl?: string;
  isFree: boolean;
  tags?: string[];
  updatedAt: Date;
}

export interface EventFilter {
  title?: string,
  categoryId?: number,
  adminId?: number;
  slug?: string;
}

export interface EventDto {
  tags: string[];
}

export interface EventResponse {
  id: number;
  categoryId: number | null;
  adminId: number;
  title: string;
  slug: string;
  descriptionMd?: unknown;
  tags?: string[];
  locationName?: string;
  locationDetail?: string;
  startDatetime: Date;
  endDatetime?: Date;
  isAllDay?: boolean;
  status: string;
  coverImageUrl?: string;
  isFree?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
