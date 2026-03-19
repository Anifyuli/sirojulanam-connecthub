import "dotenv/config";
import { defineConfig, MariaDbDriver } from "@mikro-orm/mariadb";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

export default defineConfig({
  dbName: process.env.DB_NAME as string,
  driver: MariaDbDriver,
  entities: ['dist/entities/*.js'],
  entitiesTs: ['src/entities/*.ts'],
  user: process.env.DB_USER as string,
  password: process.env.DB_PASS as string,
  port: Number(process.env.DB_PORT) || 3306,
  metadataProvider: TsMorphMetadataProvider,
  allowGlobalContext: true,
  migrations: {
    path: 'src/migrations',
  },
});
