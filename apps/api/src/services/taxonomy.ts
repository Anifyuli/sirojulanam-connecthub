import { EntityManager } from "@mikro-orm/core";
import { EventCategories } from "../entities/EventCategories.ts";
import { EventTags } from "../entities/EventTags.ts";
import { BlogCategories } from "../entities/BlogCategories.ts";
import { BlogTags } from "../entities/BlogTags.ts";
import { VideoCategories } from "../entities/VideoCategories.ts";
import { VideoTags } from "../entities/VideoTags.ts";
import { Events } from "../entities/Events.ts";
import { BlogPosts } from "../entities/BlogPosts.ts";
import { Videos } from "../entities/Videos.ts";
import { Quotes } from "../entities/Quotes.ts";
import { QuoteTags } from "../entities/Quotes.ts";
import { InspirationalFigures } from "../entities/InspirationalFigures.ts";
import { FigureTags } from "../entities/InspirationalFigures.ts";
import { Posts } from "../entities/Posts.ts";
import { PostTags } from "../entities/PostTags.ts";

export type TaxonomyType = "event" | "blog" | "video" | "quote" | "figure" | "post";
export type TaxonomyKind = "category" | "tag";

interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  color_hex: string | null;
  item_count: number;
  type: TaxonomyType;
}

interface TagResponse {
  tag: string;
  count: number;
  type: TaxonomyType;
}

export class TaxonomyService {
  constructor(private readonly em: EntityManager) { }

  private getCategoryEntity(type: TaxonomyType) {
    switch (type) {
      case "event": return EventCategories;
      case "blog": return BlogCategories;
      case "video": return VideoCategories;
      case "quote": return null;
      case "figure": return null;
      case "post": return null;
    }
  }

  private getTagEntity(type: TaxonomyType) {
    switch (type) {
      case "event": return EventTags;
      case "blog": return BlogTags;
      case "video": return VideoTags;
      case "quote": return QuoteTags;
      case "figure": return FigureTags;
      case "post": return PostTags;
    }
  }

  private getContentEntity(type: TaxonomyType) {
    switch (type) {
      case "event": return Events;
      case "blog": return BlogPosts;
      case "video": return Videos;
      case "quote": return Quotes;
      case "figure": return InspirationalFigures;
      case "post": return Posts;
    }
  }

  async getCategories(type: TaxonomyType): Promise<CategoryResponse[]> {
    const entity = this.getCategoryEntity(type);
    if (!entity) return [];
    
    const categories = await this.em.find(entity, {});
    
    const contentEntity = this.getContentEntity(type);
    const typeField = type === "event" ? "category" : 
                      type === "blog" ? "category" : "category";

    const results: CategoryResponse[] = await Promise.all(
      categories.map(async (cat) => {
        const count = await this.em.count(contentEntity, { [typeField]: { id: cat.id } });
        return {
          id: Number(cat.id),
          name: cat.name,
          slug: cat.slug,
          color_hex: (cat as any).colorHex ?? null,
          item_count: count,
          type,
        };
      })
    );

    return results;
  }

  async getCategoryById(type: TaxonomyType, id: number): Promise<CategoryResponse | null> {
    const entity = this.getCategoryEntity(type);
    if (!entity) return null;
    
    const cat = await this.em.findOne(entity, { id });
    
    if (!cat) return null;

    const contentEntity = this.getContentEntity(type);
    const typeField = type === "event" ? "category" : 
                      type === "blog" ? "category" : "category";
    const count = await this.em.count(contentEntity, { [typeField]: { id: cat.id } });

    return {
      id: Number(cat.id),
      name: cat.name,
      slug: cat.slug,
      color_hex: (cat as any).colorHex ?? null,
      item_count: count,
      type,
    };
  }

  async createCategory(type: TaxonomyType, data: { name: string; slug: string; colorHex?: string }): Promise<CategoryResponse> {
    const entity = this.getCategoryEntity(type);
    if (!entity) throw new Error(`Categories not supported for type: ${type}`);
    
    const category = new entity();
    category.name = data.name;
    category.slug = data.slug;
    if (data.colorHex) {
      (category as any).colorHex = data.colorHex;
    }

    this.em.persist(category);
    await this.em.flush();

    return {
      id: Number(category.id),
      name: category.name,
      slug: category.slug,
      color_hex: (category as any).colorHex ?? null,
      item_count: 0,
      type,
    };
  }

  async updateCategory(type: TaxonomyType, id: number, data: { name?: string; slug?: string; colorHex?: string }): Promise<CategoryResponse | null> {
    const entity = this.getCategoryEntity(type);
    if (!entity) return null;
    
    const category = await this.em.findOne(entity, { id });
    
    if (!category) return null;

    if (data.name) category.name = data.name;
    if (data.slug) category.slug = data.slug;
    if (data.colorHex !== undefined) {
      (category as any).colorHex = data.colorHex;
    }

    await this.em.flush();

    const contentEntity = this.getContentEntity(type);
    const typeField = type === "event" ? "category" : 
                      type === "blog" ? "category" : "category";
    const count = await this.em.count(contentEntity, { [typeField]: { id: category.id } });

    return {
      id: Number(category.id),
      name: category.name,
      slug: category.slug,
      color_hex: (category as any).colorHex ?? null,
      item_count: count,
      type,
    };
  }

  async deleteCategory(type: TaxonomyType, id: number): Promise<boolean> {
    const entity = this.getCategoryEntity(type);
    if (!entity) return false;
    
    const category = await this.em.findOne(entity, { id });
    
    if (!category) return false;

    this.em.remove(category);
    await this.em.flush();
    return true;
  }

  async getTags(type: TaxonomyType): Promise<TagResponse[]> {
    const entity = this.getTagEntity(type);
    if (!entity) return [];
    
    const tags = await this.em.find(entity, {});
    
    const tagCounts = new Map<string, number>();
    for (const t of tags) {
      const current = tagCounts.get(t.tag) || 0;
      tagCounts.set(t.tag, current + 1);
    }

    return Array.from(tagCounts.entries()).map(([tag, count]) => ({
      tag,
      count,
      type,
    }));
  }

  async getTagByName(type: TaxonomyType, tag: string): Promise<TagResponse | null> {
    const entity = this.getTagEntity(type);
    const tags = await this.em.find(entity, { tag });
    
    if (tags.length === 0) return null;

    return {
      tag,
      count: tags.length,
      type,
    };
  }

  async deleteTag(type: TaxonomyType, tag: string): Promise<boolean> {
    const entity = this.getTagEntity(type);
    const tags = await this.em.find(entity, { tag });
    
    if (tags.length === 0) return false;

    for (const t of tags) {
      this.em.remove(t);
    }
    await this.em.flush();
    return true;
  }

  async createTag(type: TaxonomyType, tag: string): Promise<TagResponse> {
    const entity = this.getTagEntity(type);
    const tagEntity = new entity();
    tagEntity.tag = tag;
    
    this.em.persist(tagEntity);
    await this.em.flush();
    
    return {
      tag,
      count: 0,
      type,
    };
  }
}
