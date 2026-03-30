import { Request, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import { FigureService } from "../services/figures.ts";
import { CreateFigureDto, UpdateFigureDto } from "../types/InspirationalFigure.ts";

export class FigureController {
  private readonly service: FigureService;

  constructor(em: EntityManager) {
    this.service = new FigureService(em);
  }

  getAllPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isFeatured, page, limit } = req.query;
      const filter: any = {};

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
      const { isPublished, isFeatured, page, limit } = req.query;
      const filter: any = {};

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

      const figure = await this.service.findById(id);

      if (!figure) {
        return res.status(404).json({ error: "Figure not found" });
      }

      res.json({ success: true, data: figure });
    } catch (error) {
      next(error);
    }
  };

  getFeatured = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const figures = await this.service.findFeatured();
      res.json(figures);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = res.locals.admin.id;
      const data: CreateFigureDto = { ...req.body, adminId };
      const figure = await this.service.create(data);
      res.status(201).json(figure);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.params.id as string);
      const data: UpdateFigureDto = req.body;
      const figure = await this.service.update(id, data);
      res.json(figure);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.params.id as string);
      const deleted = await this.service.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Figure not found" });
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