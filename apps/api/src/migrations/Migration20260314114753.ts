import { Migration } from '@mikro-orm/migrations';

export class Migration20260314114753 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`prayer_times\` drop index \`uq_prayer_date\`;`);

    this.addSql(`alter table \`prayer_times\` add \`short_date\` int not null, add \`day\` varchar(255) not null, add \`dhuha\` varchar(255) not null;`);
    this.addSql(`alter table \`prayer_times\` change \`date\` \`long_date\` date not null;`);
    this.addSql(`alter table \`prayer_times\` add unique \`uq_prayer_date\`(\`long_date\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`prayer_times\` drop index \`uq_prayer_date\`;`);
    this.addSql(`alter table \`prayer_times\` drop column \`short_date\`, drop column \`day\`, drop column \`dhuha\`;`);

    this.addSql(`alter table \`prayer_times\` change \`long_date\` \`date\` date not null;`);
    this.addSql(`alter table \`prayer_times\` add unique \`uq_prayer_date\`(\`date\`);`);
  }

}
