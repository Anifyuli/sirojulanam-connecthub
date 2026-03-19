import { Migration } from '@mikro-orm/migrations';

export class Migration20260314122853 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`prayer_times\` drop index \`uq_prayer_date\`;`);

    this.addSql(`alter table \`prayer_times\` add \`date\` varchar(255) not null, add \`city\` varchar(255) not null, add \`province\` varchar(255) not null, add \`updated_at\` timestamp null;`);
    this.addSql(`alter table \`prayer_times\` modify \`short_date\` varchar(255) not null, modify \`day\` varchar(255) not null;`);
    this.addSql(`alter table \`prayer_times\` add unique \`prayer_times_date_city_unique\`(\`date\`, \`city\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`prayer_times\` drop index \`prayer_times_date_city_unique\`;`);
    this.addSql(`alter table \`prayer_times\` drop column \`date\`, drop column \`city\`, drop column \`province\`, drop column \`updated_at\`;`);

    this.addSql(`alter table \`prayer_times\` modify \`short_date\` int null, modify \`day\` varchar(255) null;`);
    this.addSql(`alter table \`prayer_times\` add unique \`uq_prayer_date\`(\`long_date\`);`);
  }

}
