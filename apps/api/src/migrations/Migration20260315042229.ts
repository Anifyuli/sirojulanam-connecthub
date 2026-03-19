import { Migration } from '@mikro-orm/migrations';

export class Migration20260315042229 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`admins\` add \`username\` varchar(50) not null;`);
    this.addSql(`alter table \`admins\` add unique \`username\`(\`username\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`admins\` drop index \`username\`;`);
    this.addSql(`alter table \`admins\` drop column \`username\`;`);
  }

}
