import { Migration } from '@mikro-orm/migrations';

export class Migration20260329000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE \`quotes\` ADD COLUMN \`title\` VARCHAR(200) NULL AFTER \`category_id\`;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE \`quotes\` DROP COLUMN \`title\`;`);
  }

}
