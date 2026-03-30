import { EntityManager } from "@mikro-orm/core";
import { InspirationalFigures, FigureTags } from "../entities/InspirationalFigures.ts";
import { Admins } from "../entities/Admins.ts";
import { CreateFigureDto, UpdateFigureDto, FigureFilter, FigureResponse } from "../types/InspirationalFigure.ts";
import { PaginationParams, PaginatedResponse } from "../types/pagination.ts";
import { processImageUrl, deleteFile, extractS3KeyFromUrl } from "../lib/storage.ts";
import { processQuillContent } from "../lib/contentStorage.ts";

export class FigureService {
  constructor(private readonly em: EntityManager) { }

  private async mapToResponse(figure: InspirationalFigures): Promise<FigureResponse> {
    await figure.tags.init();
    const tags = figure.tags.getItems().map((t) => t.tag);

    const response: FigureResponse = {
      id: Number(figure.id),
      adminId: Number(figure.admin.id),
      admin: {
        id: Number(figure.admin.id),
        name: figure.admin.name,
        username: figure.admin.username,
      },
      name: figure.name,
      title: figure.title ?? "",
      bio: figure.bio ?? "",
      imageUrl: figure.imageUrl ?? "",
      birthYear: figure.birthYear ?? "",
      deathYear: figure.deathYear ?? "",
      isPublished: figure.isPublished,
      isFeatured: figure.isFeatured,
      tags,
      createdAt: figure.createdAt!,
      updatedAt: figure.updatedAt!,
    };
    return response;
  }

  private async setTags(figure: InspirationalFigures, tags: string[]): Promise<void> {
    await figure.tags.init();
    const existingTags = figure.tags.getItems();
    for (const existingTag of existingTags) {
      this.em.remove(existingTag);
    }
    await this.em.flush();
    for (const tag of tags) {
      const figureTag = new FigureTags();
      figureTag.figure = figure;
      figureTag.tag = tag;
      this.em.persist(figureTag);
    }
  }

  async find(filter: FigureFilter = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<FigureResponse>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filter.isPublished !== undefined) {
      where.isPublished = filter.isPublished;
    }
    if (filter.isFeatured !== undefined) {
      where.isFeatured = filter.isFeatured;
    }
    if (filter.adminId) {
      where.admin = { id: filter.adminId };
    }

    const [figures, total] = await Promise.all([
      this.em.find(InspirationalFigures, where, {
        orderBy: { name: 'ASC' },
        limit,
        offset,
        populate: ['admin', 'tags'],
      }),
      this.em.count(InspirationalFigures, where),
    ]);

    const data = await Promise.all(figures.map((f) => this.mapToResponse(f)));

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

  async findAll(): Promise<FigureResponse[]> {
    return (await this.find({}, { page: 1, limit: 100 })).data;
  }

  async findById(id: bigint): Promise<FigureResponse | null> {
    const figure = await this.em.findOne(InspirationalFigures, { id }, { populate: ['admin', 'tags'] });
    if (!figure) return null;
    return this.mapToResponse(figure);
  }

  async findByName(name: string): Promise<FigureResponse | null> {
    const figure = await this.em.findOne(InspirationalFigures, { name }, { populate: ['admin', 'tags'] });
    if (!figure) return null;
    return this.mapToResponse(figure);
  }

  async findFeatured(): Promise<FigureResponse[]> {
    return (await this.find({ isFeatured: true }, { page: 1, limit: 10 })).data;
  }

  async create(data: CreateFigureDto): Promise<FigureResponse> {
    const admin = await this.em.findOneOrFail(Admins, { id: data.adminId });

    const [processedImageUrl, processedBio] = await Promise.all([
      processImageUrl(data.imageUrl),
      data.bio ? processQuillContent(data.bio).then(r => r.html) : Promise.resolve(""),
    ]);

    const figure = new InspirationalFigures();
    figure.admin = admin;
    figure.name = data.name;
    figure.title = data.title;
    figure.bio = processedBio;
    figure.imageUrl = processedImageUrl;
    figure.birthYear = data.birthYear;
    figure.deathYear = data.deathYear;
    figure.isPublished = data.isPublished ?? true;
    figure.isFeatured = data.isFeatured ?? false;

    this.em.persist(figure);
    await this.em.flush();

    if (data.tags && data.tags.length > 0) {
      await this.setTags(figure, data.tags);
      await this.em.flush();
    }

    return this.mapToResponse(figure);
  }

  async update(id: bigint, data: UpdateFigureDto): Promise<FigureResponse> {
    const figure = await this.em.findOneOrFail(InspirationalFigures, { id });
    const oldImageUrl = figure.imageUrl;

    let processedImageUrl = figure.imageUrl;
    let processedBio = figure.bio;

    if (data.imageUrl !== undefined) {
      processedImageUrl = await processImageUrl(data.imageUrl);
      if (oldImageUrl && oldImageUrl !== processedImageUrl) {
        const oldKey = extractS3KeyFromUrl(oldImageUrl);
        if (oldKey?.startsWith("uploads/")) {
          await deleteFile(oldKey).catch(console.error);
        }
      }
    }

    if (data.bio !== undefined) {
      const { html } = await processQuillContent(data.bio);
      processedBio = html;
    }

    figure.name = data.name ?? figure.name;
    figure.title = data.title ?? figure.title;
    figure.bio = processedBio;
    figure.imageUrl = processedImageUrl;
    figure.birthYear = data.birthYear ?? figure.birthYear;
    figure.deathYear = data.deathYear ?? figure.deathYear;
    figure.isPublished = data.isPublished ?? figure.isPublished;
    figure.isFeatured = data.isFeatured ?? figure.isFeatured;

    if (data.tags !== undefined) {
      await this.setTags(figure, data.tags);
    }

    figure.updatedAt = new Date();
    await this.em.flush();

    return this.mapToResponse(figure);
  }

  async delete(id: bigint): Promise<boolean> {
    const figure = await this.em.findOne(InspirationalFigures, { id });
    if (!figure) return false;

    if (figure.imageUrl) {
      const key = extractS3KeyFromUrl(figure.imageUrl);
      if (key?.startsWith("uploads/")) {
        await deleteFile(key).catch(console.error);
      }
    }

    this.em.remove(figure);
    await this.em.flush();
    return true;
  }

  async getTags(): Promise<{ tag: string }[]> {
    const figureTags = await this.em.find(FigureTags, {}, { orderBy: { tag: 'ASC' } });
    const tags = figureTags.map(ft => ft.tag);
    const uniqueTags = [...new Set(tags)];
    return uniqueTags.map(tag => ({ tag }));
  }
}