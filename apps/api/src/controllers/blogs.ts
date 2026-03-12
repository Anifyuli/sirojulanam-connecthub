import { Request, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";

export class BlogController {
  constructor(em: EntityManager) { }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    return null
  }
}
