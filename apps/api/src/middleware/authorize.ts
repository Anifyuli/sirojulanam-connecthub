import { Request, Response, NextFunction } from "express";
import { RequestContext, type EntityManager } from "@mikro-orm/core";

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

export function isManager(user: AuthUser): boolean {
  return user.role === "manager";
}

export function getAuthUser(res: Response): AuthUser | undefined {
  return res.locals.admin as AuthUser | undefined;
}

type EntityType = "blog" | "video" | "event";

const tableConfig: Record<EntityType, { tableName: string; adminColumn: string }> = {
  blog: { tableName: "blog_posts", adminColumn: "admin_id" },
  video: { tableName: "videos", adminColumn: "admin_id" },
  event: { tableName: "events", adminColumn: "admin_id" },
};

export async function checkOwnership(
  em: EntityManager,
  resourceId: number,
  userId: number,
  entityType: EntityType
): Promise<boolean> {
  const { tableName, adminColumn } = tableConfig[entityType];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (em as any).execute(
    `SELECT ${adminColumn} as admin_id FROM ${tableName} WHERE id = ?`,
    [resourceId]
  );
  
  if (!result || (result as unknown[]).length === 0) {
    return false;
  }
  
  const adminId = (result as { admin_id: bigint }[])[0]?.admin_id;
  return Number(adminId) === userId;
}

export function authorizeOwnership(entityType: EntityType) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const user = getAuthUser(res);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    if (isManager(user)) {
      return next();
    }

    const resourceId = parseInt(_req.params.id as string, 10);
    
    if (isNaN(resourceId)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_ID",
        message: "Invalid resource ID",
      });
    }

    const em = RequestContext.getEntityManager();
    if (!em) {
      return res.status(500).json({
        success: false,
        code: "INTERNAL_ERROR",
        message: "Database connection not available",
      });
    }

    const isOwner = await checkOwnership(em, resourceId, user.id, entityType);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        message: "Anda tidak memiliki akses untuk mengelola konten ini",
      });
    }

    next();
  };
}