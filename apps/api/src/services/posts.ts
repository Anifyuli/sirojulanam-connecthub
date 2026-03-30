import { EntityManager } from "@mikro-orm/core";
import { Posts, PostType } from "../entities/Posts.ts";
import { PostReactions, ReactionType } from "../entities/PostReactions.ts";
import { PostTags } from "../entities/PostTags.ts";
import { Quotes } from "../entities/Quotes.ts";
import { InspirationalFigures } from "../entities/InspirationalFigures.ts";
import { Admins } from "../entities/Admins.ts";
import { CreatePostDto, UpdatePostDto, PostFilter, PostResponse, AddReactionDto } from "../types/Post.ts";
import { PaginationParams, PaginatedResponse } from "../types/pagination.ts";
import { processQuillContent, cleanupOldImages } from "../lib/contentStorage.ts";

export class PostService {
  constructor(private readonly em: EntityManager) { }

  private async setTags(post: Posts, tags: string[]): Promise<void> {
    post.tags.removeAll();
    for (const tag of tags) {
      const postTag = new PostTags(tag);
      postTag.post = post;
      this.em.persist(postTag);
    }
  }

  private async mapToResponse(post: Posts): Promise<PostResponse> {
    await Promise.all([post.reactions.init(), post.tags.init()]);

    const reactionGroups: Record<string, number> = post.reactions.getItems().reduce<Record<string, number>>((acc, r) => {
      const key = String(r.reactionType);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const reactions: { reactionType: string; count: number }[] = Object.entries(reactionGroups).map(([type, count]) => ({
      reactionType: type,
      count,
    }));

    const tags = post.tags.getItems().map((t) => t.tag);

    let quote = undefined;
    if (post.quote) {
      quote = {
        id: Number(post.quote.id),
        content: post.quote.content,
        source: post.quote.source ?? "",
      };
    }

    let figure = undefined;
    if (post.figure) {
      figure = {
        id: Number(post.figure.id),
        name: post.figure.name,
        title: post.figure.title ?? "",
        imageUrl: post.figure.imageUrl ?? "",
      };
    }

    return {
      id: Number(post.id),
      adminId: Number(post.admin.id),
      admin: {
        id: Number(post.admin.id),
        name: post.admin.name,
        username: post.admin.username,
      },
      type: post.type,
      title: post.title,
      content: post.content,
      quoteId: post.quote?.id ? Number(post.quote.id) : null,
      quote,
      figureId: post.figure?.id ? Number(post.figure.id) : null,
      figure,
      isPublished: post.isPublished,
      viewCount: post.viewCount,
      reactions,
      reactionCount: post.reactions.getItems().length,
      tags,
      createdAt: post.createdAt!,
      updatedAt: post.updatedAt!,
    };
  }

  async find(filter: PostFilter = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<PostResponse>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filter.type) {
      where.type = filter.type;
    }
    if (filter.isPublished !== undefined) {
      where.isPublished = filter.isPublished;
    }
    if (filter.adminId) {
      where.admin = { id: filter.adminId };
    }

    const [posts, total] = await Promise.all([
      this.em.find(Posts, where, {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
        populate: ['admin', 'quote', 'figure', 'reactions', 'tags'],
      }),
      this.em.count(Posts, where),
    ]);

    const data = await Promise.all(posts.map((p) => this.mapToResponse(p)));

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

  async findAll(): Promise<PostResponse[]> {
    return (await this.find({}, { page: 1, limit: 100 })).data;
  }

  async findById(id: bigint): Promise<PostResponse | null> {
    const post = await this.em.findOne(Posts, { id }, {
      populate: ['admin', 'quote', 'figure', 'reactions', 'tags'],
    });
    if (!post) return null;
    return this.mapToResponse(post);
  }

  async create(data: CreatePostDto): Promise<PostResponse> {
    const admin = await this.em.findOneOrFail(Admins, { id: data.adminId });

    const { html: processedContent } = await processQuillContent(data.content);

    const post = new Posts();
    post.admin = admin;
    post.type = data.type;
    post.title = data.title;
    post.content = processedContent;
    post.isPublished = data.isPublished ?? true;

    if (data.quoteId) {
      post.quote = this.em.getReference(Quotes, BigInt(data.quoteId));
    }
    if (data.figureId) {
      post.figure = this.em.getReference(InspirationalFigures, BigInt(data.figureId));
    }

    this.em.persist(post);
    await this.em.flush();

    if (data.tags && data.tags.length > 0) {
      await this.setTags(post, data.tags);
      await this.em.flush();
    }

    return this.mapToResponse(post);
  }

  async update(id: bigint, data: UpdatePostDto): Promise<PostResponse> {
    const post = await this.em.findOneOrFail(Posts, { id });

    if (data.type) post.type = data.type;
    if (data.title) post.title = data.title;
    if (data.content) {
      await cleanupOldImages(String(post.content ?? ""), data.content);
      const { html: processedContent } = await processQuillContent(data.content);
      post.content = processedContent;
    }
    if (data.isPublished !== undefined) post.isPublished = data.isPublished;

    if (data.quoteId !== undefined) {
      post.quote = data.quoteId ? this.em.getReference(Quotes, BigInt(data.quoteId)) : undefined;
    }
    if (data.figureId !== undefined) {
      post.figure = data.figureId ? this.em.getReference(InspirationalFigures, BigInt(data.figureId)) : undefined;
    }

    if (data.tags !== undefined) {
      await this.setTags(post, data.tags);
    }

    post.updatedAt = new Date();
    await this.em.flush();

    return this.mapToResponse(post);
  }

  async delete(id: bigint): Promise<boolean> {
    const post = await this.em.findOne(Posts, { id });
    if (!post) return false;

    await cleanupOldImages(String(post.content ?? ""), "");

    this.em.remove(post);
    await this.em.flush();
    return true;
  }

  async addReaction(postId: bigint, data: AddReactionDto): Promise<void> {
    const [post, admin] = await Promise.all([
      this.em.findOneOrFail(Posts, { id: postId }),
      this.em.findOneOrFail(Admins, { id: data.adminId }),
    ]);

    const existingReaction = await this.em.findOne(PostReactions, {
      post,
      admin,
      reactionType: data.reactionType as ReactionType,
    });

    if (existingReaction) {
      this.em.remove(existingReaction);
    } else {
      const reaction = new PostReactions();
      reaction.post = post;
      reaction.admin = admin;
      reaction.reactionType = data.reactionType as ReactionType;
      this.em.persist(reaction);
    }

    await this.em.flush();
  }

  async incrementViewCount(id: bigint): Promise<void> {
    const post = await this.em.findOne(Posts, { id });
    if (post) {
      post.viewCount = (post.viewCount || 0) + 1;
      await this.em.flush();
    }
  }
}