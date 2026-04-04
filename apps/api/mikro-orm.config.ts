import "dotenv/config";
import { defineConfig, MariaDbDriver, ReflectMetadataProvider } from "@mikro-orm/mariadb";
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
// When running compiled code, __dirname will be 'dist', so we need to go up one level
const baseDir = isProduction ? path.join(__dirname, '..') : process.cwd();

export default defineConfig({
  dbName: process.env.DB_NAME as string,
  driver: MariaDbDriver,
  entities: isProduction
    ? [path.join(baseDir, 'dist/src/entities/*.js')]
    : [path.join(baseDir, 'src/entities/*.ts')],
  entitiesTs: isProduction ? undefined : [path.join(baseDir, 'src/entities/*.ts')],
  user: process.env.DB_USER as string,
  password: process.env.DB_PASS as string,
  port: Number(process.env.DB_PORT) || 3306,
  metadataProvider: ReflectMetadataProvider,
  allowGlobalContext: true,
  migrations: {
    path: isProduction ? path.join(baseDir, 'dist/src/migrations') : path.join(process.cwd(), 'src/migrations'),
  },
});
