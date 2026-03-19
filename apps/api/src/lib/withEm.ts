import { Request, Response, NextFunction } from "express";
import { RequestContext } from "@mikro-orm/core";

type ControllerMethod = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

export function withEm(createController: (em: any) => { [key: string]: ControllerMethod }): {
  [key: string]: ControllerMethod;
} {
  const controller = createController(RequestContext.getEntityManager()!);
  return controller;
}
