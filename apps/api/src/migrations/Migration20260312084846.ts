import { Migration } from '@mikro-orm/migrations';

export class Migration20260312084846 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`daily_prayer_schedule\` (\`pray_time\` tinyint unsigned not null auto_increment primary key, \`imam\` varchar(150) not null) default character set utf8mb4 engine = InnoDB;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`daily_prayer_schedule\`;`);
  }

}
