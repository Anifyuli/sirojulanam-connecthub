import { Request, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import { VideoService } from "../services/videos.ts";
import { CreateVideoDto, UpdateVideoDto } from "../types/Video.ts";

export class VideoController {
  private readonly service: VideoService;

  constructor(em: EntityManager) {
    this.service = new VideoService(em);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, categoryId, adminId, slug, sourceType, isPublished, page, limit } = req.query;
      const filter: any = {};

      if (title) filter.title = title as string;
      if (categoryId) filter.categoryId = parseInt(categoryId as string, 10);
      if (adminId) filter.adminId = parseInt(adminId as string, 10);
      if (slug) filter.slug = slug as string;
      if (sourceType) filter.sourceType = sourceType as string;
      if (isPublished !== undefined) filter.isPublished = isPublished === "true";

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
          error: "Invalid video ID",
        });
        return;
      }

      const video = await this.service.findById(id);

      if (!video) {
        res.status(404).json({
          success: false,
          error: "Video not found",
        });
        return;
      }

      res.json({
        success: true,
        data: video,
      });
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

      const video = await this.service.findByTitle(slug);

      if (!video) {
        res.status(404).json({
          success: false,
          error: "Video not found",
        });
        return;
      }

      res.json({
        success: true,
        data: video,
      });
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

      const videos = await this.service.findByCategory(categoryId);
      res.json({
        success: true,
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateVideoDto = req.body;

      const video = await this.service.create(data);

      res.status(201).json({
        success: true,
        data: video,
      });
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
          error: "Invalid video ID",
        });
        return;
      }

      const data: UpdateVideoDto = req.body;
      const video = await this.service.update(id, data);

      res.json({
        success: true,
        data: video,
      });
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
          error: "Invalid video ID",
        });
        return;
      }

      const deleted = await this.service.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: "Video not found",
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
      const videoId = parseInt(req.params.id as string, 10);

      if (isNaN(videoId)) {
        res.status(400).json({
          success: false,
          error: "Invalid video ID",
        });
        return;
      }

      const tags = await this.service.getTags(videoId);
      res.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  };

  addTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = parseInt(req.params.id as string, 10);
      const { tags } = req.body;

      if (isNaN(videoId)) {
        res.status(400).json({
          success: false,
          error: "Invalid video ID",
        });
        return;
      }

      await this.service.addTags(videoId, tags);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  setTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = parseInt(req.params.id as string, 10);
      const { tags } = req.body;

      if (isNaN(videoId)) {
        res.status(400).json({
          success: false,
          error: "Invalid video ID",
        });
        return;
      }

      await this.service.setTags(videoId, tags);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  removeTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = parseInt(req.params.id as string, 10);
      const { tags } = req.body;

      if (isNaN(videoId)) {
        res.status(400).json({
          success: false,
          error: "Invalid video ID",
        });
        return;
      }

      await this.service.removeTags(videoId, tags);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  clearTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = parseInt(req.params.id as string, 10);

      if (isNaN(videoId)) {
        res.status(400).json({
          success: false,
          error: "Invalid video ID",
        });
        return;
      }

      await this.service.clearTags(videoId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
