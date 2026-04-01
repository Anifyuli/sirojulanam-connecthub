import { MikroORM } from '@mikro-orm/mariadb';
import config from '../../mikro-orm.config';

let orm: MikroORM | null = null;

export async function initEntityManager(): Promise<MikroORM> {
  if (!orm) {
    orm = await MikroORM.init(config);
  }
  return orm;
}

export function getOrm(): MikroORM {
  if (!orm) {
    throw new Error('MikroORM not initialized. Call initEntityManager() first.');
  }
  return orm;
}

export async function closeEntityManager(): Promise<void> {
  if (orm) {
    await orm.close();
    orm = null;
  }
}
