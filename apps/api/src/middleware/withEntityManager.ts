import { RequestHandler } from "express";
import { RequestContext, EntityManager } from "@mikro-orm/core";

export function withEntityManager<T>(
  factory: (em: EntityManager) => T
): RequestHandler {
  return (_req, _res, next) => {
    const em = RequestContext.getEntityManager();
    if (!em) {
      next(new Error("EntityManager not available in RequestContext"));
      return;
    }
    const instance = factory(em);
    (globalThis as any).__controllerInstance = instance;
    next();
  };
}

export function getController<T>(): T {
  return (globalThis as any).__controllerInstance;
}
