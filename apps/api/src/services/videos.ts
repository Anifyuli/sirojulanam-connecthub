import { EntityManager } from "@mikro-orm/core";
import { Videos } from "../entities/Videos.ts";
import { VideoTags } from "../entities/VideoTags.ts";
import { VideoCategories } from "../entities/VideoCategories.ts";
import { Admins } from "../entities/Admins.ts";
import { CreateVideoDto, UpdateVideoDto, VideoFilter, VideoResponse } from "../types/Video.ts";
import { PaginationParams, PaginatedResponse } from "../types/pagination.ts";

export interface VideoTagDto {
  tags: string[];
}

export class VideoService {
  constructor(private readonly em: EntityManager) { }

  private async mapToResponse(video: Videos): Promise<VideoResponse> {
    const tags = await this.getTags(Number(video.id));

    return {
      id: Number(video.id),
      categoryId: video.category?.id ? Number(video.category.id) : null,
      adminId: video.admin.id,
      title: video.title,
      slug: video.slug,
      description: video.description ?? undefined,
      sourceType: video.sourceType,
      sourceUrl: video.sourceUrl ?? undefined,
      platformVideoId: video.platformVideoId ?? undefined,
      localFileUrl: video.localFileUrl ?? undefined,
      thumbnailUrl: video.thumbnailUrl ?? undefined,
      durationSeconds: video.durationSeconds,
      isPublished: video.isPublished,
      isFeatured: video.isFeatured,
      publishedAt: video.publishedAt,
      viewCount: video.viewCount,
      createdAt: video.createdAt!,
      updatedAt: video.updatedAt!,
    };
  }

  async find(filter: VideoFilter = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<VideoResponse>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filter.title) {
      where.title = { $contains: filter.title };
    }
    if (filter.categoryId) {
      where.category = { id: filter.categoryId };
    }
    if (filter.adminId) {
      where.admin = { id: filter.adminId };
    }
    if (filter.slug) {
      where.slug = filter.slug;
    }
    if (filter.sourceType) {
      where.sourceType = filter.sourceType;
    }
    if (filter.isPublished !== undefined) {
      where.isPublished = filter.isPublished;
    }

    const [videos, total] = await Promise.all([
      this.em.find(Videos, where, {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      }),
      this.em.count(Videos, where),
    ]);

    const data = await Promise.all(videos.map((video) => this.mapToResponse(video)));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findAll(): Promise<VideoResponse[]> {
    return (await this.find({}, { page: 1, limit: 100 })).data;
  }

  async findByTitle(title: string): Promise<VideoResponse | null> {
    const video = await this.em.findOne(Videos, { title });

    if (!video) {
      return null;
    }

    return this.mapToResponse(video);
  }

  async findById(id: number): Promise<VideoResponse | null> {
    const video = await this.em.findOne(Videos, { id });

    if (!video) {
      return null;
    }

    return this.mapToResponse(video);
  }

  async findByCategory(categoryId: number): Promise<VideoResponse[]> {
    return (await this.find({ categoryId }, { page: 1, limit: 100 })).data;
  }

  async create(data: CreateVideoDto): Promise<VideoResponse> {
    const video = new Videos();
    video.admin = this.em.getReference(Admins, data.adminId);
    video.category = data.categoryId ? this.em.getReference(VideoCategories, data.categoryId) : undefined;
    video.title = data.title;
    video.slug = data.slug;
    video.description = data.description;
    video.sourceType = data.sourceType;
    video.sourceUrl = data.sourceUrl;
    video.platformVideoId = data.platformVideoId;
    video.localFileUrl = data.localFileUrl;
    video.thumbnailUrl = data.thumbnailUrl;
    video.durationSeconds = data.durationSeconds;
    video.isPublished = data.isPublished ?? false;
    video.isFeatured = data.isFeatured ?? false;
    video.publishedAt = data.publishedAt;

    this.em.persist(video);
    await this.em.flush();

    return this.mapToResponse(video);
  }

  async update(id: number, data: UpdateVideoDto): Promise<VideoResponse> {
    const video = await this.em.findOneOrFail(Videos, { id });

    video.title = data.title ?? video.title;
    video.slug = data.slug ?? video.slug;
    video.description = data.description ?? video.description;
    video.sourceType = data.sourceType ?? video.sourceType;
    video.sourceUrl = data.sourceUrl ?? video.sourceUrl;
    video.platformVideoId = data.platformVideoId ?? video.platformVideoId;
    video.localFileUrl = data.localFileUrl ?? video.localFileUrl;
    video.thumbnailUrl = data.thumbnailUrl ?? video.thumbnailUrl;
    video.durationSeconds = data.durationSeconds ?? video.durationSeconds;
    video.isPublished = data.isPublished ?? video.isPublished;
    video.isFeatured = data.isFeatured ?? video.isFeatured;
    video.publishedAt = data.publishedAt ?? video.publishedAt;

    if (data.categoryId !== undefined) {
      video.category = data.categoryId ? this.em.getReference(VideoCategories, data.categoryId) : undefined;
    }

    video.updatedAt = new Date();

    await this.em.flush();

    return this.mapToResponse(video);
  }

  async delete(id: number): Promise<boolean> {
    const video = await this.em.findOne(Videos, { id });

    if (!video) {
      return false;
    }

    this.em.remove(video);
    await this.em.flush();
    return true;
  }

  async getTags(videoId: number): Promise<string[]> {
    const videoTags = await this.em.find(VideoTags, { video: { id: videoId } });
    return videoTags.map((vt) => vt.tag);
  }

  async addTags(videoId: number, tags: string[]): Promise<void> {
    const video = await this.em.findOneOrFail(Videos, { id: videoId });

    for (const tag of tags) {
      const existingTag = await this.em.findOne(VideoTags, { video, tag });
      if (!existingTag) {
        const videoTag = new VideoTags();
        videoTag.video = video;
        videoTag.tag = tag.trim();
        this.em.persist(videoTag);
      }
    }

    await this.em.flush();
  }

  async removeTags(videoId: number, tags: string[]): Promise<void> {
    const videoTags = await this.em.find(VideoTags, {
      video: { id: videoId },
      tag: { $in: tags },
    });

    for (const videoTag of videoTags) {
      this.em.remove(videoTag);
    }

    await this.em.flush();
  }

  async clearTags(videoId: number): Promise<void> {
    const videoTags = await this.em.find(VideoTags, { video: { id: videoId } });

    for (const videoTag of videoTags) {
      this.em.remove(videoTag);
    }

    await this.em.flush();
  }

  async setTags(videoId: number, tags: string[]): Promise<void> {
    await this.clearTags(videoId);
    await this.addTags(videoId, tags);
  }
}
