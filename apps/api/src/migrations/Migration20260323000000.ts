import { Migration } from '@mikro-orm/migrations';

export class Migration20260323000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`events\` modify \`start_datetime\` timestamp null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`events\` modify \`start_datetime\` timestamp not null;`);
  }

}
