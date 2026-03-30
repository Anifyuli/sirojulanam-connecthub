import { Migration } from '@mikro-orm/migrations';

export class Migration20260326075417 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`prayer_times\` modify \`imsak\` varchar(8) not null, modify \`fajr\` varchar(8) not null, modify \`sunrise\` varchar(8) not null, modify \`dhuha\` varchar(8) not null, modify \`dhuhr\` varchar(8) not null, modify \`asr\` varchar(8) not null, modify \`maghrib\` varchar(8) not null, modify \`isha\` varchar(8) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`prayer_times\` modify \`imsak\` time not null, modify \`fajr\` time not null, modify \`sunrise\` time not null, modify \`dhuha\` time not null, modify \`dhuhr\` time not null, modify \`asr\` time not null, modify \`maghrib\` time not null, modify \`isha\` time not null;`);
  }

}
