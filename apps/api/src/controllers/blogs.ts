import { Request, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import { BlogService } from "../services/blogs.ts";
import { CreateBlogPostDto, UpdateBlogPostDto } from "../types/Blog.ts";

export class BlogController {
  private readonly service: BlogService;

  constructor(em: EntityManager) {
    this.service = new BlogService(em);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, categoryId, adminId, isPublished, isFeatured, slug, page, limit } = req.query;
      const filter: any = {};

      if (title) filter.title = title as string;
      if (categoryId) filter.categoryId = parseInt(categoryId as string, 10);
      if (adminId) filter.adminId = parseInt(adminId as string, 10);
      if (isPublished !== undefined) filter.isPublished = isPublished === "true";
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
      if (slug) filter.slug = slug as string;

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      };

      const result = await this.service.find(filter, pagination);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid blog ID",
        });
        return;
      }

      const blog = await this.service.findById(id);

      if (!blog) {
        return res.status(404).json({
          error: "Blog not found",
        });
      }

      res.json(blog);
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;

      if (!slug || Array.isArray(slug)) {
        res.status(400).json({
          success: false,
          error: "Missing required param: slug",
        });
        return;
      }

      const blog = await this.service.findBySlug(slug);

      if (!blog) {
        return res.status(404).json({
          error: "Blog not found",
        });
      }

      res.json(blog);
    } catch (error) {
      next(error);
    }
  };

  getByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoryId = parseInt(req.params.categoryId as string, 10);

      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          error: "Invalid category ID",
        });
        return;
      }

      const blogs = await this.service.findByCategory(categoryId);
      res.json(blogs);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateBlogPostDto = req.body;

      // Transform publishedAt from string to Date if provided
      if (data.publishedAt && typeof data.publishedAt === 'string') {
        data.publishedAt = new Date(data.publishedAt);
      }

      const blog = await this.service.create(data);

      res.status(201).json(blog);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid blog ID",
        });
        return;
      }

      const data: UpdateBlogPostDto = req.body;

      // Transform publishedAt from string to Date if provided
      if (data.publishedAt && typeof data.publishedAt === 'string') {
        data.publishedAt = new Date(data.publishedAt);
      }

      const blog = await this.service.update(id, data);

      res.json(blog);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid blog ID",
        });
        return;
      }

      const deleted = await this.service.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: "Blog not found",
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = parseInt(req.params.id as string, 10);

      if (isNaN(postId)) {
        res.status(400).json({
          success: false,
          error: "Invalid post ID",
        });
        return;
      }

      const tags = await this.service.getTags(postId);
      res.json(tags);
    } catch (error) {
      next(error);
    }
  };

  addTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = parseInt(req.params.id as string, 10);
      const { tags } = req.body;

      if (isNaN(postId)) {
        res.status(400).json({
          success: false,
          error: "Invalid post ID",
        });
        return;
      }

      await this.service.addTags(postId, tags);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  setTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = parseInt(req.params.id as string, 10);
      const { tags } = req.body;

      if (isNaN(postId)) {
        res.status(400).json({
          success: false,
          error: "Invalid post ID",
        });
        return;
      }

      await this.service.setTags(postId, tags);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  removeTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = parseInt(req.params.id as string, 10);
      const { tags } = req.body;

      if (isNaN(postId)) {
        res.status(400).json({
          success: false,
          error: "Invalid post ID",
        });
        return;
      }

      await this.service.removeTags(postId, tags);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  clearTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = parseInt(req.params.id as string, 10);

      if (isNaN(postId)) {
        res.status(400).json({
          success: false,
          error: "Invalid post ID",
        });
        return;
      }

      await this.service.clearTags(postId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
