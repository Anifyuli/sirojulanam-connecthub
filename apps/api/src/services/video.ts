import { EntityManager } from "@mikro-orm/mariadb";
import { Videos } from "../entities/Videos.js";
import { VideoTags } from "../entities/VideoTags.js";
import { VideoCategories } from "../entities/VideoCategories.js";
import { CreateVideoDto, UpdateVideoDto, VideoFilter, VideoResponse } from "../types/Video.js";
import { Admins } from "../entities/Admins.js";

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
      description: video.description,
      sourceType: video.sourceType,
      sourceUrl: video.sourceUrl,
      platformVideoId: video.platformVideoId,
      localFileUrl: video.localFileUrl,
      durationSeconds: video.durationSeconds,
      isPublished: video.isPublished,
      isFeatured: video.isFeatured,
      publishedAt: video.publishedAt,
      viewCount: video.viewCount,
      tags,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    };
  }

  async find(filter: VideoFilter = {}): Promise<VideoResponse[]> {
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
    if (filter.isPublished) {
      where.isPublished = filter.isPublished;
    }
    if (filter.slug) {
      where.slug = filter.slug;
    }

    const videos = await this.em.find(Videos, where, { orderBy: { createdAt: 'DESC' } });

    return Promise.all(videos.map((vid) => this.mapToResponse(vid)));
  }

  async findAll(): Promise<VideoResponse[]> {
    return this.find();
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
    return this.find({ categoryId });
  }

  async create(data: CreateVideoDto): Promise<VideoResponse> {
    const admin = await this.em.findOneOrFail(Admins, { id: data.adminId }, { populate: ['role'] });
    
    const video = new Videos();
    video.admin = admin;
    video.category = data.categoryId ? this.em.getReference(VideoCategories, data.categoryId) : undefined;
    video.title = data.title;
    video.slug = data.slug;
    video.description = data.description;
    video.sourceType = data.sourceType;
    video.sourceUrl = data.sourceUrl;
    video.platformVideoId = data.platformVideoId;
    video.localFileUrl = data.localFileUrl;
    video.durationSeconds = data.durationSeconds;
    video.isPublished = data.isPublished ?? false;
    video.isFeatured = data.isFeatured ?? false;
    video.publishedAt = data.publishedAt;

    this.em.persist(video);
    await this.em.flush();

    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        const videoTag = new VideoTags();
        videoTag.video = video;
        videoTag.tag = tag.trim();
        this.em.persist(videoTag);
      }
      await this.em.flush();
    }

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
    video.durationSeconds = data.durationSeconds ?? video.durationSeconds;
    video.isPublished = data.isPublished ?? video.isPublished;
    video.isFeatured = data.isFeatured ?? video.isFeatured;
    video.publishedAt = data.publishedAt ?? video.publishedAt;

    if (data.categoryId !== undefined) {
      video.category = data.categoryId ? this.em.getReference(VideoCategories, data.categoryId) : undefined;
    }

    if (data.tags !== undefined) {
      const existingTags = await this.em.find(VideoTags, { video });
      this.em.remove(existingTags);

      for (const tag of data.tags) {
        const videoTag = new VideoTags();
        videoTag.video = video;
        videoTag.tag = tag.trim();
        this.em.persist(videoTag);
      }
    }

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
    return videoTags.map((vid) => vid.tag);
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

  async clearTags(videoId: number): Promise<void> {
    const videoTags = await this.em.find(VideoTags, { video: { id: videoId } });

    for (const videoTag of videoTags) {
      this.em.remove(videoTag);
    }

    await this.em.flush();
  }

  async setTags(videoId: number, tags: string[]) {
    await this.clearTags(videoId);
    await this.addTags(videoId, tags)
  }
}
