import { Migration } from '@mikro-orm/migrations';

export class Migration20260328111237 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`quote_categories\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(100) not null, \`slug\` varchar(120) not null, \`color_hex\` varchar(7) null, \`created_at\` timestamp null default current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`quote_categories\` add unique \`quote_categories_slug_unique\`(\`slug\`);`);

    this.addSql(`create table \`quotes\` (\`id\` bigint unsigned not null auto_increment primary key, \`category_id\` int unsigned null, \`title\` varchar(200) null, \`admin_id\` int unsigned not null, \`content\` text not null, \`source\` varchar(200) null, \`is_published\` tinyint(1) not null default true, \`is_featured\` tinyint(1) not null default false, \`created_at\` timestamp null default current_timestamp(), \`updated_at\` timestamp null default current_timestamp() on update current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`quotes\` add index \`quotes_category_id_index\`(\`category_id\`);`);
    this.addSql(`alter table \`quotes\` add index \`fk_quote_admin\`(\`admin_id\`);`);
    this.addSql(`alter table \`quotes\` add index \`idx_quote_content\`(\`content\`);`);

    this.addSql(`create table \`quote_tags\` (\`id\` int unsigned not null auto_increment primary key, \`quote_id\` bigint unsigned not null, \`tag\` varchar(80) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`quote_tags\` add index \`quote_tags_quote_id_index\`(\`quote_id\`);`);

    this.addSql(`create table \`inspirational_figures\` (\`id\` bigint unsigned not null auto_increment primary key, \`admin_id\` int unsigned not null, \`name\` varchar(150) not null, \`title\` varchar(100) null, \`bio\` text null, \`image_url\` varchar(500) null, \`birth_year\` varchar(10) null, \`death_year\` varchar(10) null, \`is_published\` tinyint(1) not null default true, \`is_featured\` tinyint(1) not null default false, \`created_at\` timestamp null default current_timestamp(), \`updated_at\` timestamp null default current_timestamp() on update current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`inspirational_figures\` add index \`fk_figure_admin\`(\`admin_id\`);`);
    this.addSql(`alter table \`inspirational_figures\` add index \`idx_figure_name\`(\`name\`);`);

    this.addSql(`create table \`posts\` (\`id\` bigint unsigned not null auto_increment primary key, \`admin_id\` int unsigned not null, \`type\` enum('opinion', 'quote_of_day', 'figure_spotlight') not null default 'opinion', \`title\` varchar(300) not null, \`content\` text not null, \`quote_id\` bigint unsigned null, \`figure_id\` bigint unsigned null, \`is_published\` tinyint(1) not null default true, \`view_count\` int unsigned not null default 0, \`created_at\` timestamp null default current_timestamp(), \`updated_at\` timestamp null default current_timestamp() on update current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`posts\` add index \`fk_post_admin\`(\`admin_id\`);`);
    this.addSql(`alter table \`posts\` add index \`posts_quote_id_index\`(\`quote_id\`);`);
    this.addSql(`alter table \`posts\` add index \`posts_figure_id_index\`(\`figure_id\`);`);
    this.addSql(`alter table \`posts\` add index \`idx_post_created\`(\`created_at\`);`);
    this.addSql(`alter table \`posts\` add index \`idx_post_type\`(\`type\`);`);

    this.addSql(`create table \`post_tags\` (\`post_id\` bigint unsigned not null, \`tag\` varchar(80) not null, primary key (\`post_id\`, \`tag\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`post_tags\` add index \`post_tags_post_id_index\`(\`post_id\`);`);
    this.addSql(`alter table \`post_tags\` add index \`idx_post_tags_tag\`(\`tag\`);`);

    this.addSql(`create table \`post_reactions\` (\`id\` bigint unsigned not null auto_increment primary key, \`post_id\` bigint unsigned not null, \`admin_id\` int unsigned not null, \`reaction_type\` enum('like', 'love', 'inspiring', 'pray') not null, \`created_at\` timestamp null default current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`post_reactions\` add index \`fk_reaction_post\`(\`post_id\`);`);
    this.addSql(`alter table \`post_reactions\` add index \`fk_reaction_admin\`(\`admin_id\`);`);
    this.addSql(`alter table \`post_reactions\` add index \`idx_reaction_admin\`(\`admin_id\`);`);
    this.addSql(`alter table \`post_reactions\` add index \`idx_reaction_post\`(\`post_id\`);`);

    this.addSql(`create table \`figure_tags\` (\`id\` int unsigned not null auto_increment primary key, \`figure_id\` bigint unsigned not null, \`tag\` varchar(80) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`figure_tags\` add index \`figure_tags_figure_id_index\`(\`figure_id\`);`);

    this.addSql(`alter table \`quotes\` add constraint \`quotes_category_id_foreign\` foreign key (\`category_id\`) references \`quote_categories\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`quotes\` add constraint \`quotes_admin_id_foreign\` foreign key (\`admin_id\`) references \`admins\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`quote_tags\` add constraint \`quote_tags_quote_id_foreign\` foreign key (\`quote_id\`) references \`quotes\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`inspirational_figures\` add constraint \`inspirational_figures_admin_id_foreign\` foreign key (\`admin_id\`) references \`admins\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`posts\` add constraint \`posts_admin_id_foreign\` foreign key (\`admin_id\`) references \`admins\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`posts\` add constraint \`posts_quote_id_foreign\` foreign key (\`quote_id\`) references \`quotes\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`posts\` add constraint \`posts_figure_id_foreign\` foreign key (\`figure_id\`) references \`inspirational_figures\` (\`id\`) on update cascade on delete set null;`);

    this.addSql(`alter table \`post_tags\` add constraint \`post_tags_post_id_foreign\` foreign key (\`post_id\`) references \`posts\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`post_reactions\` add constraint \`post_reactions_post_id_foreign\` foreign key (\`post_id\`) references \`posts\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`post_reactions\` add constraint \`post_reactions_admin_id_foreign\` foreign key (\`admin_id\`) references \`admins\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`figure_tags\` add constraint \`figure_tags_figure_id_foreign\` foreign key (\`figure_id\`) references \`inspirational_figures\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`jumat_schedules\` modify \`pasaran\` tinyint unsigned not null auto_increment;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`quotes\` drop foreign key \`quotes_category_id_foreign\`;`);

    this.addSql(`alter table \`quote_tags\` drop foreign key \`quote_tags_quote_id_foreign\`;`);

    this.addSql(`alter table \`posts\` drop foreign key \`posts_quote_id_foreign\`;`);

    this.addSql(`alter table \`posts\` drop foreign key \`posts_figure_id_foreign\`;`);

    this.addSql(`alter table \`figure_tags\` drop foreign key \`figure_tags_figure_id_foreign\`;`);

    this.addSql(`alter table \`post_tags\` drop foreign key \`post_tags_post_id_foreign\`;`);

    this.addSql(`alter table \`post_reactions\` drop foreign key \`post_reactions_post_id_foreign\`;`);

    this.addSql(`drop table if exists \`quote_categories\`;`);

    this.addSql(`drop table if exists \`quotes\`;`);

    this.addSql(`drop table if exists \`quote_tags\`;`);

    this.addSql(`drop table if exists \`inspirational_figures\`;`);

    this.addSql(`drop table if exists \`posts\`;`);

    this.addSql(`drop table if exists \`post_tags\`;`);

    this.addSql(`drop table if exists \`post_reactions\`;`);

    this.addSql(`drop table if exists \`figure_tags\`;`);

    this.addSql(`alter table \`jumat_schedules\` modify \`pasaran\` varchar(10) not null;`);
  }

}
