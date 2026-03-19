import { Migration } from '@mikro-orm/migrations';

export class Migration20260314115451 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`prayer_times\` modify \`dhuha\` time not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`prayer_times\` modify \`dhuha\` varchar(255) not null;`);
  }

}
