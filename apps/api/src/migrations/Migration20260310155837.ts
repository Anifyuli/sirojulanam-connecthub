import { Migration } from '@mikro-orm/migrations';

export class Migration20260310155837 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`blog_categories\` (\`id\` smallint unsigned not null auto_increment primary key, \`name\` varchar(100) not null, \`slug\` varchar(120) not null, \`color_hex\` char(7) null, \`created_at\` timestamp null default current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`blog_categories\` add unique \`slug\`(\`slug\`);`);

    this.addSql(`create table \`event_categories\` (\`id\` smallint unsigned not null auto_increment primary key, \`name\` varchar(100) not null, \`slug\` varchar(120) not null, \`color_hex\` char(7) null, \`created_at\` timestamp null default current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`event_categories\` add unique \`slug\`(\`slug\`);`);

    this.addSql(`create table \`jumat_schedules\` (\`id\` int unsigned not null auto_increment primary key, \`pasaran\` enum('pon', 'wage', 'kliwon', 'legi', 'pahing') not null, \`imam\` varchar(150) not null, \`khotib\` varchar(150) not null, \`bilal\` varchar(150) not null, \`created_at\` timestamp null default current_timestamp(), \`updated_at\` timestamp null default current_timestamp() on update current_timestamp()) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`prayer_times\` (\`id\` int unsigned not null auto_increment primary key, \`date\` date not null, \`imsak\` time not null, \`fajr\` time not null, \`sunrise\` time not null, \`dhuhr\` time not null, \`asr\` time not null, \`maghrib\` time not null, \`isha\` time not null, \`created_at\` timestamp null default current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`prayer_times\` add unique \`uq_prayer_date\`(\`date\`);`);

    this.addSql(`create table \`roles\` (\`id\` tinyint unsigned not null auto_increment primary key, \`name\` varchar(30) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`roles\` add unique \`name\`(\`name\`);`);

    this.addSql(`create table \`admins\` (\`id\` int unsigned not null auto_increment primary key, \`role_id\` tinyint unsigned not null, \`name\` varchar(100) not null, \`email\` varchar(150) not null, \`password_hash\` varchar(255) not null, \`is_active\` tinyint(1) not null default true, \`created_at\` timestamp null default current_timestamp(), \`updated_at\` timestamp null default current_timestamp() on update current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`admins\` add index \`fk_admin_role\`(\`role_id\`);`);
    this.addSql(`alter table \`admins\` add unique \`email\`(\`email\`);`);

    this.addSql(`create table \`events\` (\`id\` bigint unsigned not null auto_increment primary key, \`category_id\` smallint unsigned null, \`admin_id\` int unsigned not null, \`title\` varchar(300) not null, \`slug\` varchar(350) not null, \`description_md\` longtext null, \`location_name\` varchar(200) null, \`location_detail\` text null, \`start_datetime\` datetime not null, \`end_datetime\` datetime null, \`is_all_day\` tinyint(1) not null default false, \`status\` enum('draft', 'published', 'cancelled', 'completed') not null default 'draft', \`cover_image_url\` varchar(500) null, \`is_free\` tinyint(1) not null default true, \`registration_url\` varchar(500) null, \`created_at\` timestamp null default current_timestamp(), \`updated_at\` timestamp null default current_timestamp() on update current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`events\` add index \`fk_event_category\`(\`category_id\`);`);
    this.addSql(`alter table \`events\` add index \`fk_event_admin\`(\`admin_id\`);`);
    this.addSql(`alter table \`events\` add unique \`slug\`(\`slug\`);`);

    this.addSql(`create table \`event_tags\` (\`event_id\` bigint unsigned not null, \`tag\` varchar(80) not null, primary key (\`event_id\`, \`tag\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`event_tags\` add index \`event_tags_event_id_index\`(\`event_id\`);`);

    this.addSql(`create table \`blog_posts\` (\`id\` bigint unsigned not null auto_increment primary key, \`category_id\` smallint unsigned null, \`admin_id\` int unsigned not null, \`title\` varchar(300) not null, \`slug\` varchar(350) not null, \`excerpt\` varchar(500) null, \`content_md\` longtext not null, \`cover_image_url\` varchar(500) null, \`is_published\` tinyint(1) not null default false, \`is_featured\` tinyint(1) not null default false, \`published_at\` timestamp null, \`view_count\` int unsigned not null default 0, \`meta_title\` varchar(300) null, \`meta_description\` varchar(500) null, \`created_at\` timestamp null default current_timestamp(), \`updated_at\` timestamp null default current_timestamp() on update current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`blog_posts\` add index \`fk_post_category\`(\`category_id\`);`);
    this.addSql(`alter table \`blog_posts\` add index \`fk_post_admin\`(\`admin_id\`);`);
    this.addSql(`alter table \`blog_posts\` add unique \`slug\`(\`slug\`);`);
    this.addSql(`alter table \`blog_posts\` add index \`idx_post_slug\`(\`slug\`);`);
    this.addSql(`alter table \`blog_posts\` add index \`idx_post_title\`(\`title\`);`);

    this.addSql(`create table \`blog_tags\` (\`post_id\` bigint unsigned not null, \`tag\` varchar(80) not null, primary key (\`post_id\`, \`tag\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`blog_tags\` add index \`blog_tags_post_id_index\`(\`post_id\`);`);

    this.addSql(`create table \`video_categories\` (\`id\` smallint unsigned not null auto_increment primary key, \`name\` varchar(100) not null, \`slug\` varchar(120) not null, \`created_at\` timestamp null default current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`video_categories\` add unique \`slug\`(\`slug\`);`);

    this.addSql(`create table \`videos\` (\`id\` bigint unsigned not null auto_increment primary key, \`category_id\` smallint unsigned null, \`admin_id\` int unsigned not null, \`title\` varchar(300) not null, \`slug\` varchar(350) not null, \`description\` text null, \`source_type\` enum('youtube', 'youtube_shorts', 'tiktok', 'local') not null, \`source_url\` varchar(500) null, \`platform_video_id\` varchar(50) null, \`local_file_url\` varchar(500) null, \`thumbnail_url\` varchar(500) null, \`duration_seconds\` int unsigned null, \`is_published\` tinyint(1) not null default false, \`is_featured\` tinyint(1) not null default false, \`published_at\` timestamp null, \`view_count\` int unsigned not null default 0, \`created_at\` timestamp null default current_timestamp(), \`updated_at\` timestamp null default current_timestamp() on update current_timestamp()) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`videos\` add index \`fk_video_category\`(\`category_id\`);`);
    this.addSql(`alter table \`videos\` add index \`fk_video_admin\`(\`admin_id\`);`);
    this.addSql(`alter table \`videos\` add unique \`slug\`(\`slug\`);`);

    this.addSql(`create table \`video_tags\` (\`video_id\` bigint unsigned not null, \`tag\` varchar(80) not null, primary key (\`video_id\`, \`tag\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`video_tags\` add index \`video_tags_video_id_index\`(\`video_id\`);`);

    this.addSql(`alter table \`admins\` add constraint \`admins_role_id_foreign\` foreign key (\`role_id\`) references \`roles\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`events\` add constraint \`events_category_id_foreign\` foreign key (\`category_id\`) references \`event_categories\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`events\` add constraint \`events_admin_id_foreign\` foreign key (\`admin_id\`) references \`admins\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`event_tags\` add constraint \`event_tags_event_id_foreign\` foreign key (\`event_id\`) references \`events\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`blog_posts\` add constraint \`blog_posts_category_id_foreign\` foreign key (\`category_id\`) references \`blog_categories\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`blog_posts\` add constraint \`blog_posts_admin_id_foreign\` foreign key (\`admin_id\`) references \`admins\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`blog_tags\` add constraint \`blog_tags_post_id_foreign\` foreign key (\`post_id\`) references \`blog_posts\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`videos\` add constraint \`videos_category_id_foreign\` foreign key (\`category_id\`) references \`video_categories\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`videos\` add constraint \`videos_admin_id_foreign\` foreign key (\`admin_id\`) references \`admins\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`video_tags\` add constraint \`video_tags_video_id_foreign\` foreign key (\`video_id\`) references \`videos\` (\`id\`) on update cascade on delete cascade;`);
  }

}
