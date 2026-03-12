import { Migration } from '@mikro-orm/migrations';

export class Migration20260312085857 extends Migration {

  override async up(): Promise<void> {
    // 1. Hapus AUTO_INCREMENT dari id dulu sebelum drop primary key
    this.addSql(`alter table \`jumat_schedules\` modify \`id\` int unsigned not null;`);

    // 2. Baru drop primary key
    this.addSql(`alter table \`jumat_schedules\` drop primary key;`);

    // 3. Drop kolom yang tidak diperlukan
    this.addSql(`alter table \`jumat_schedules\` drop column \`id\`, drop column \`created_at\`, drop column \`updated_at\`;`);

    // 4. Set pasaran sebagai primary key (enum, bukan auto_increment)
    this.addSql(`alter table \`jumat_schedules\` modify \`pasaran\` enum('pon','wage','kliwon','legi','pahing') not null;`);
    this.addSql(`alter table \`jumat_schedules\` add primary key \`jumat_schedules_pkey\`(\`pasaran\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`jumat_schedules\` drop primary key;`);

    this.addSql(`alter table \`jumat_schedules\` add \`id\` int unsigned not null auto_increment, add \`created_at\` timestamp null default current_timestamp(), add \`updated_at\` timestamp null default current_timestamp() on update current_timestamp();`);
    this.addSql(`alter table \`jumat_schedules\` modify \`pasaran\` enum('pon', 'wage', 'kliwon', 'legi', 'pahing') not null;`);
    this.addSql(`alter table \`jumat_schedules\` add primary key \`jumat_schedules_pkey\`(\`id\`);`);
    this.addSql(`alter table \`jumat_schedules\` modify column \`id\` int unsigned not null auto_increment;`);
  }

}
