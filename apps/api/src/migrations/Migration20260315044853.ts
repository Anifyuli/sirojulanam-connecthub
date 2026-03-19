import { Migration } from '@mikro-orm/migrations';

export class Migration20260315044853 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`refresh_tokens\` (\`id\` int unsigned not null auto_increment primary key, \`admin_id\` int unsigned not null, \`token\` varchar(255) not null, \`expires_at\` timestamp not null, \`created_at\` timestamp not null default current_timestamp(), \`is_revoked\` tinyint(1) not null default true) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`refresh_tokens\` add index \`refresh_tokens_admin_id_index\`(\`admin_id\`);`);
    this.addSql(`alter table \`refresh_tokens\` add unique \`token\`(\`token\`);`);

    this.addSql(`alter table \`refresh_tokens\` add constraint \`refresh_tokens_admin_id_foreign\` foreign key (\`admin_id\`) references \`admins\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`refresh_tokens\`;`);
  }

}
