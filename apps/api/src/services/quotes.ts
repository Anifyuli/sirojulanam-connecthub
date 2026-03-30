import { EntityManager } from "@mikro-orm/core";
import { Quotes, QuoteTags } from "../entities/Quotes.ts";
import { QuoteCategories } from "../entities/QuoteCategories.ts";
import { Admins } from "../entities/Admins.ts";
import { CreateQuoteDto, UpdateQuoteDto, QuoteFilter, QuoteResponse, CreateQuoteCategoryDto, QuoteCategoryResponse } from "../types/Quote.ts";
import { PaginationParams, PaginatedResponse } from "../types/pagination.ts";

export class QuoteService {
  constructor(private readonly em: EntityManager) { }

  private async mapToResponse(quote: Quotes): Promise<QuoteResponse> {
    await quote.tags.init();
    const tags = quote.tags.getItems().map((t) => t.tag);

    const response: QuoteResponse = {
      id: Number(quote.id),
      title: quote.title,
      categoryId: quote.category?.id ? Number(quote.category.id) : null,
      category: quote.category ? {
        id: Number(quote.category.id),
        name: quote.category.name,
        slug: quote.category.slug,
      } : undefined,
      adminId: Number(quote.admin.id),
      admin: {
        id: Number(quote.admin.id),
        name: quote.admin.name,
        username: quote.admin.username,
      },
      content: quote.content,
      source: quote.source ?? "",
      isPublished: quote.isPublished,
      isFeatured: quote.isFeatured,
      tags,
      createdAt: quote.createdAt!,
      updatedAt: quote.updatedAt!,
    };
    return response;
  }

  private async setTags(quote: Quotes, tags: string[]): Promise<void> {
    await quote.tags.init();
    const existingTags = quote.tags.getItems();
    for (const existingTag of existingTags) {
      this.em.remove(existingTag);
    }
    await this.em.flush();
    for (const tag of tags) {
      const quoteTag = new QuoteTags();
      quoteTag.quote = quote;
      quoteTag.tag = tag;
      this.em.persist(quoteTag);
    }
  }

  async find(filter: QuoteFilter = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<QuoteResponse>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filter.categoryId) {
      where.category = { id: filter.categoryId };
    }
    if (filter.isPublished !== undefined) {
      where.isPublished = filter.isPublished;
    }
    if (filter.isFeatured !== undefined) {
      where.isFeatured = filter.isFeatured;
    }
    if (filter.adminId) {
      where.admin = { id: filter.adminId };
    }

    const [quotes, total] = await Promise.all([
      this.em.find(Quotes, where, {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
        populate: ['category', 'admin'],
      }),
      this.em.count(Quotes, where),
    ]);

    const data = await Promise.all(quotes.map((q) => this.mapToResponse(q)));

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

  async findAll(): Promise<QuoteResponse[]> {
    return (await this.find({}, { page: 1, limit: 100 })).data;
  }

  async findById(id: bigint): Promise<QuoteResponse | null> {
    const quote = await this.em.findOne(Quotes, { id }, { populate: ['admin', 'category'] });
    if (!quote) return null;
    return this.mapToResponse(quote);
  }

  async findByCategory(categoryId: number): Promise<QuoteResponse[]> {
    return (await this.find({ categoryId }, { page: 1, limit: 100 })).data;
  }

  async findRandom(): Promise<QuoteResponse | null> {
    const quotes = await this.em.find(Quotes, { isPublished: true }, { limit: 1 });
    if (quotes.length === 0) return null;
    return this.mapToResponse(quotes[0]);
  }

  async create(data: CreateQuoteDto): Promise<QuoteResponse> {
    const admin = await this.em.findOneOrFail(Admins, { id: data.adminId });

    const quote = new Quotes();
    quote.admin = admin;
    quote.title = data.title;
    quote.category = data.categoryId ? this.em.getReference(QuoteCategories, data.categoryId) : undefined;
    quote.content = data.content;
    quote.source = data.source;
    quote.isPublished = data.isPublished ?? true;
    quote.isFeatured = data.isFeatured ?? false;

    this.em.persist(quote);
    await this.em.flush();

    if (data.tags && data.tags.length > 0) {
      await this.setTags(quote, data.tags);
      await this.em.flush();
    }

    return this.mapToResponse(quote);
  }

  async update(id: bigint, data: UpdateQuoteDto): Promise<QuoteResponse> {
    const quote = await this.em.findOneOrFail(Quotes, { id });

    quote.title = data.title ?? quote.title;
    quote.content = data.content ?? quote.content;
    quote.source = data.source;
    quote.isPublished = data.isPublished ?? quote.isPublished;
    quote.isFeatured = data.isFeatured ?? quote.isFeatured;

    if (data.categoryId !== undefined) {
      quote.category = data.categoryId ? this.em.getReference(QuoteCategories, data.categoryId) : undefined;
    }

    if (data.tags !== undefined) {
      await this.setTags(quote, data.tags);
    }

    quote.updatedAt = new Date();
    await this.em.flush();

    return this.mapToResponse(quote);
  }

  async delete(id: bigint): Promise<boolean> {
    const quote = await this.em.findOne(Quotes, { id });
    if (!quote) return false;
    this.em.remove(quote);
    await this.em.flush();
    return true;
  }

  // Categories
  async findCategories(): Promise<QuoteCategoryResponse[]> {
    const categories = await this.em.find(QuoteCategories, {}, { orderBy: { name: 'ASC' } });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      colorHex: c.colorHex ?? "",
      createdAt: c.createdAt!,
    }));
  }

  async createCategory(data: CreateQuoteCategoryDto): Promise<QuoteCategoryResponse> {
    const category = new QuoteCategories();
    category.name = data.name;
    category.slug = data.slug;
    category.colorHex = data.colorHex;

    this.em.persist(category);
    await this.em.flush();

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      colorHex: category.colorHex ?? "",
      createdAt: category.createdAt!,
    };
  }

  async deleteCategory(id: number): Promise<boolean> {
    const category = await this.em.findOne(QuoteCategories, { id });
    if (!category) return false;
    this.em.remove(category);
    await this.em.flush();
    return true;
  }

  async getTags(): Promise<{ tag: string }[]> {
    const quoteTags = await this.em.find(QuoteTags, {}, { orderBy: { tag: 'ASC' } });
    const tags = quoteTags.map(qt => qt.tag);
    const uniqueTags = [...new Set(tags)];
    return uniqueTags.map(tag => ({ tag }));
  }
}