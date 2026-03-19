import { Request, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import { EventService } from "../services/event.ts";
import { CreateEventDto, UpdateEventDto } from "../types/Event.ts";

export class EventController {
  private readonly service: EventService;

  constructor(em: EntityManager) {
    this.service = new EventService(em);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, categoryId, adminId, slug, page, limit } = req.query;
      const filter: any = {};

      if (title) filter.title = title as string;
      if (categoryId) filter.categoryId = parseInt(categoryId as string, 10);
      if (adminId) filter.adminId = parseInt(adminId as string, 10);
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
          error: "Invalid event ID",
        });
        return;
      }

      const event = await this.service.findById(id);

      if (!event) {
        res.status(404).json({
          success: false,
          error: "Event not found",
        });
        return;
      }

      res.json({
        success: true,
        data: event,
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

      const event = await this.service.findByTitle(slug);

      if (!event) {
        res.status(404).json({
          success: false,
          error: "Event not found",
        });
        return;
      }

      res.json({
        success: true,
        data: event,
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

      const events = await this.service.findByCategory(categoryId);
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateEventDto = req.body;

      const event = await this.service.create(data);

      res.status(201).json({
        success: true,
        data: event,
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
          error: "Invalid event ID",
        });
        return;
      }

      const data: UpdateEventDto = req.body;
      const event = await this.service.update(id, data);

      res.json({
        success: true,
        data: event,
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
          error: "Invalid event ID",
        });
        return;
      }

      const deleted = await this.service.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: "Event not found",
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
      const eventId = parseInt(req.params.id as string, 10);

      if (isNaN(eventId)) {
        res.status(400).json({
          success: false,
          error: "Invalid event ID",
        });
        return;
      }

      const tags = await this.service.getTags(eventId);
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
      const eventId = parseInt(req.params.id as string, 10);
      const { tags } = req.body;

      if (isNaN(eventId)) {
        res.status(400).json({
          success: false,
          error: "Invalid event ID",
        });
        return;
      }

      await this.service.addTags(eventId, tags);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  setTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId = parseInt(req.params.id as string, 10);
      const { tags } = req.body;

      if (isNaN(eventId)) {
        res.status(400).json({
          success: false,
          error: "Invalid event ID",
        });
        return;
      }

      await this.service.setTags(eventId, tags);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  removeTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId = parseInt(req.params.id as string, 10);
      const { tags } = req.body;

      if (isNaN(eventId)) {
        res.status(400).json({
          success: false,
          error: "Invalid event ID",
        });
        return;
      }

      await this.service.removeTags(eventId, tags);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  clearTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId = parseInt(req.params.id as string, 10);

      if (isNaN(eventId)) {
        res.status(400).json({
          success: false,
          error: "Invalid event ID",
        });
        return;
      }

      await this.service.clearTags(eventId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
