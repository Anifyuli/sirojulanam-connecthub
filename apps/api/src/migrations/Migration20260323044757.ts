import { Migration } from '@mikro-orm/migrations';

export class Migration20260323044757 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`events\` modify \`start_datetime\` datetime null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`events\` modify \`start_datetime\` datetime not null;`);
  }

}
