import { EntityManager } from "@mikro-orm/core";
import { BlogPosts } from "../entities/BlogPosts.js";
import { BlogTags } from "../entities/BlogTags.js";
import { BlogCategories } from "../entities/BlogCategories.js";
import { Admins } from "../entities/Admins.js";
import { CreateBlogPostDto, UpdateBlogPostDto, BlogPostFilter, BlogPostResponse } from "../types/Blog.js";
import { PaginationParams, PaginatedResponse } from "../types/pagination.js";
import { processQuillContent, cleanupOldImages } from "../lib/contentStorage.js";
import { processImageUrl } from "../lib/storage.js";

export class BlogService {
  constructor(private readonly em: EntityManager) { }

  private async mapToResponse(blog: BlogPosts): Promise<BlogPostResponse> {
    await blog.tags.init();
    const tags = blog.tags.getItems().map((bt) => bt.tag);

    const response: BlogPostResponse = {
      id: Number(blog.id),
      categoryId: blog.category?.id ? Number(blog.category.id) : null,
      category: blog.category ? {
        id: Number(blog.category.id),
        name: blog.category.name,
        slug: blog.category.slug,
      } : undefined,
      adminId: Number(blog.admin.id),
      admin: blog.admin ? {
        id: Number(blog.admin.id),
        name: blog.admin.name,
        username: blog.admin.username,
      } : undefined,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt ?? "",
      contentMd: String(blog.contentMd),
      coverImageUrl: blog.coverImageUrl ?? undefined,
      isPublished: blog.isPublished,
      isFeatured: blog.isFeatured,
      publishedAt: blog.publishedAt!,
      viewCount: blog.viewCount,
      metaTitle: blog.metaTitle ?? "",
      metaDescription: blog.metaDescription ?? "",
      tags,
      createdAt: blog.createdAt!,
      updatedAt: blog.updatedAt!,
    };

    return response;
  }

  async find(filter: BlogPostFilter = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<BlogPostResponse>> {
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
    if (filter.isPublished !== undefined) {
      where.isPublished = filter.isPublished;
    }
    if (filter.isFeatured !== undefined) {
      where.isFeatured = filter.isFeatured;
    }
    if (filter.slug) {
      where.slug = filter.slug;
    }

    const [blogPosts, total] = await Promise.all([
      this.em.find(BlogPosts, where, {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
        populate: ['tags', 'category', 'admin'],
      }),
      this.em.count(BlogPosts, where),
    ]);

    const data = await Promise.all(blogPosts.map((post) => this.mapToResponse(post)));

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

  async findAll(): Promise<BlogPostResponse[]> {
    return (await this.find({}, { page: 1, limit: 100 })).data;
  }

  async findByTitle(title: string): Promise<BlogPostResponse | null> {
    const blog = await this.em.findOne(BlogPosts, { title }, { populate: ['admin', 'category'] });

    if (!blog) {
      return null;
    }

    return this.mapToResponse(blog);
  }

  async findBySlug(slug: string): Promise<BlogPostResponse | null> {
    const blog = await this.em.findOne(BlogPosts, { slug }, { populate: ['admin', 'category'] });

    if (!blog) {
      return null;
    }

    return this.mapToResponse(blog);
  }

  async findById(id: number): Promise<BlogPostResponse | null> {
    const blog = await this.em.findOne(BlogPosts, { id }, { populate: ['admin', 'category'] });

    if (!blog) {
      return null;
    }

    return this.mapToResponse(blog);
  }

  async findByCategory(categoryId: number): Promise<BlogPostResponse[]> {
    return (await this.find({ categoryId }, { page: 1, limit: 100 })).data;
  }

  async create(data: CreateBlogPostDto): Promise<BlogPostResponse> {
    const admin = await this.em.findOneOrFail(Admins, { id: data.adminId }, { populate: ['role'] });
    
    const { html: processedContent } = await processQuillContent(data.contentMd);
    const coverImageUrl = data.coverImageUrl ? await processImageUrl(data.coverImageUrl) : undefined;
    
    const blog = new BlogPosts();
    blog.admin = admin;
    blog.category = data.categoryId ? this.em.getReference(BlogCategories, data.categoryId) : undefined;
    blog.title = data.title;
    blog.slug = data.slug;
    blog.excerpt = data.excerpt;
    blog.contentMd = processedContent;
    blog.coverImageUrl = coverImageUrl;
    blog.isPublished = data.isPublished ?? false;
    blog.isFeatured = data.isFeatured ?? false;

    if (data.publishedAt) {
      blog.publishedAt = typeof data.publishedAt === 'string'
        ? new Date(data.publishedAt)
        : data.publishedAt;
    } else {
      blog.publishedAt = null;
    }

    blog.metaTitle = data.metaTitle;
    blog.metaDescription = data.metaDescription;

    this.em.persist(blog);
    await this.em.flush();

    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        const blogTag = new BlogTags();
        blogTag.post = blog;
        blogTag.tag = tag.trim();
        this.em.persist(blogTag);
      }
      await this.em.flush();
      await blog.tags.init();
    }

    return this.mapToResponse(blog);
  }
  async update(id: number, data: UpdateBlogPostDto): Promise<BlogPostResponse> {
    const blog = await this.em.findOneOrFail(BlogPosts, { id });
    const oldContent = blog.contentMd;

    if (data.contentMd) {
      await cleanupOldImages(String(oldContent ?? ""), data.contentMd);
      const { html: processedContent } = await processQuillContent(data.contentMd);
      data.contentMd = processedContent;
    }

    if (data.coverImageUrl !== undefined) {
      blog.coverImageUrl = data.coverImageUrl ? await processImageUrl(data.coverImageUrl) : undefined;
    }

    blog.title = data.title;
    blog.slug = data.slug;
    blog.excerpt = data.excerpt;
    blog.contentMd = data.contentMd ?? blog.contentMd;
    blog.isPublished = data.isPublished ?? blog.isPublished;
    blog.isFeatured = data.isFeatured ?? blog.isFeatured;

    if (data.publishedAt) {
      blog.publishedAt = typeof data.publishedAt === 'string'
        ? new Date(data.publishedAt)
        : data.publishedAt;
    } else if (data.publishedAt === null) {
      blog.publishedAt = null;
    }

    blog.metaTitle = data.metaTitle;
    blog.metaDescription = data.metaDescription;

    if (data.categoryId !== undefined) {
      blog.category = data.categoryId ? this.em.getReference(BlogCategories, data.categoryId) : undefined;
    }

    if (data.tags !== undefined) {
      const existingTags = await this.em.find(BlogTags, { post: blog });
      this.em.remove(existingTags);

      blog.tags.removeAll();

      for (const tag of data.tags) {
        const blogTag = new BlogTags();
        blogTag.post = blog;
        blogTag.tag = tag.trim();
        blog.tags.add(blogTag);
      }
    }

    blog.updatedAt = new Date();

    await this.em.flush();

    return this.mapToResponse(blog);
  }

  async delete(id: number): Promise<boolean> {
    const blog = await this.em.findOne(BlogPosts, { id });

    if (!blog) {
      return false;
    }

    await cleanupOldImages(String(blog.contentMd ?? ""), "");

    this.em.remove(blog);
    await this.em.flush();
    return true;
  }

  async getTags(postId: number): Promise<string[]> {
    const blogTags = await this.em.find(BlogTags, { post: { id: postId } });
    return blogTags.map((bt) => bt.tag);
  }

  async addTags(postId: number, tags: string[]): Promise<void> {
    const blog = await this.em.findOneOrFail(BlogPosts, { id: postId });

    for (const tag of tags) {
      const existingTag = await this.em.findOne(BlogTags, { post: blog, tag });
      if (!existingTag) {
        const blogTag = new BlogTags();
        blogTag.post = blog;
        blogTag.tag = tag.trim();
        this.em.persist(blogTag);
      }
    }

    await this.em.flush();
  }

  async removeTags(postId: number, tags: string[]): Promise<void> {
    const blogTags = await this.em.find(BlogTags, {
      post: { id: postId },
      tag: { $in: tags },
    });

    for (const blogTag of blogTags) {
      this.em.remove(blogTag);
    }

    await this.em.flush();
  }

  async clearTags(postId: number): Promise<void> {
    const blogTags = await this.em.find(BlogTags, { post: { id: postId } });

    for (const blogTag of blogTags) {
      this.em.remove(blogTag);
    }

    await this.em.flush();
  }

  async setTags(postId: number, tags: string[]): Promise<void> {
    await this.clearTags(postId);
    await this.addTags(postId, tags);
  }

  async incrementViewCount(id: number): Promise<void> {
    const blog = await this.em.findOne(BlogPosts, { id });
    if (blog) {
      blog.viewCount = (blog.viewCount || 0) + 1;
      await this.em.flush();
    }
  }
}
