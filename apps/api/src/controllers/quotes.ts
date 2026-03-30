import { Request, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import { QuoteService } from "../services/quotes.ts";
import { CreateQuoteDto, UpdateQuoteDto } from "../types/Quote.ts";

export class QuoteController {
  private readonly service: QuoteService;

  constructor(em: EntityManager) {
    this.service = new QuoteService(em);
  }

  getAllPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId, isFeatured, page, limit } = req.query;
      const filter: any = {};

      if (categoryId) filter.categoryId = parseInt(categoryId as string, 10);
      filter.isPublished = true;
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

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
      const { categoryId, isPublished, isFeatured, page, limit } = req.query;
      const filter: any = {};

      if (categoryId) filter.categoryId = parseInt(categoryId as string, 10);

      const currentAdmin = res.locals.admin;
      const isEditor = currentAdmin && currentAdmin.role !== "manager";

      if (isEditor && currentAdmin) {
        filter.adminId = currentAdmin.id;
      }

      if (isPublished !== undefined) filter.isPublished = isPublished === "true";
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

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

      const quote = await this.service.findById(id);

      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      res.json({ success: true, data: quote });
    } catch (error) {
      next(error);
    }
  };

  getRandom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quote = await this.service.findRandom();

      if (!quote) {
        return res.status(404).json({ error: "No quotes found" });
      }

      res.json({ success: true, data: quote });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = res.locals.admin.id;
      const data: CreateQuoteDto = { ...req.body, adminId };
      const quote = await this.service.create(data);
      res.status(201).json(quote);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.params.id as string);
      const data: UpdateQuoteDto = req.body;
      const quote = await this.service.update(id, data);
      res.json(quote);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.params.id as string);
      const deleted = await this.service.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Quote not found" });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.service.findCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, colorHex } = req.body as { name: string; slug: string; colorHex?: string };
      const category = await this.service.createCategory({ name, slug, colorHex });
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const deleted = await this.service.deleteCategory(id);

      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tags = await this.service.getTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  };
}