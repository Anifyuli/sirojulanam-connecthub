import { Migration } from '@mikro-orm/migrations';

export class Migration20260328000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE \`figure_tags\` (
        \`id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`figure_id\` bigint unsigned NOT NULL,
        \`tag\` varchar(80) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_figure_tags_figure_id\` (\`figure_id\`),
        CONSTRAINT \`fk_figure_tag_figure\`
          FOREIGN KEY (\`figure_id\`)
          REFERENCES \`inspirational_figures\` (\`id\`)
          ON DELETE CASCADE
      );
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS \`figure_tags\`;`);
  }

}
