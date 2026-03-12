import { Migration } from '@mikro-orm/migrations';

export class Migration20260312141849 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`jumat_schedules\` modify \`pasaran\` tinyint unsigned not null auto_increment;`);

    this.addSql(`alter table \`events\` drop column \`registration_url\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`events\` add \`registration_url\` varchar(500) null;`);

    this.addSql(`alter table \`jumat_schedules\` modify \`pasaran\` enum('pon', 'wage', 'kliwon', 'legi', 'pahing') not null;`);
  }

}
