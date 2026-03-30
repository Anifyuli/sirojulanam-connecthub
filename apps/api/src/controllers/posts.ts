import { Request, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import { PostService } from "../services/posts.ts";
import { CreatePostDto, UpdatePostDto, AddReactionDto } from "../types/Post.ts";
import { PostType } from "../entities/Posts.ts";

export class PostController {
  private readonly service: PostService;

  constructor(em: EntityManager) {
    this.service = new PostService(em);
  }

  getAllPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, page, limit } = req.query;
      const filter: any = {};

      if (type) filter.type = type as PostType;
      filter.isPublished = true;

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

  getAllAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, isPublished, page, limit } = req.query;
      const filter: any = {};

      if (type) filter.type = type as PostType;

      const currentAdmin = res.locals.admin;
      const isEditor = currentAdmin && currentAdmin.role !== "manager";

      if (isEditor && currentAdmin) {
        filter.adminId = currentAdmin.id;
      }

      if (isPublished !== undefined) {
        filter.isPublished = isPublished === "true";
      }

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
      const id = BigInt(req.params.id as string);

      const post = await this.service.findById(id);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      await this.service.incrementViewCount(id);

      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = res.locals.admin.id;
      const data: CreatePostDto = { ...req.body, adminId };
      const post = await this.service.create(data);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.params.id as string);
      const data: UpdatePostDto = req.body;
      const post = await this.service.update(id, data);
      res.json(post);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.params.id as string);
      const deleted = await this.service.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  addReaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.params.id as string);
      const data: AddReactionDto = req.body;
      await this.service.addReaction(id, data);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}