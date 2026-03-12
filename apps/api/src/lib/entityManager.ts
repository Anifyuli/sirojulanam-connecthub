import { EntityManager } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/mariadb';
import config from '../../mikro-orm.config.js';

let orm: MikroORM | null = null;
let em: EntityManager | null = null;

export async function initEntityManager(): Promise<MikroORM> {
  if (!orm) {
    orm = await MikroORM.init(config);
    em = orm.em;
  }
  return orm;
}

export function getEntityManager(): EntityManager {
  if (!em) {
    throw new Error('EntityManager not initialized. Call initEntityManager() first.');
  }
  return em;
}

export async function closeEntityManager(): Promise<void> {
  if (orm) {
    await orm.close();
    orm = null;
    em = null;
  }
}
