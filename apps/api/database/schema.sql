-- ============================================================
--  DATABASE: Sistem Informasi Masjid
--  Engine   : MariaDB 10.5+
--  Charset  : utf8mb3 / utf8mb3_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS sirojulanam_connecthub
  CHARACTER SET utf8mb3
  COLLATE utf8mb3_unicode_ci;

USE sirojulanam_connecthub;

-- ============================================================
--  ADMIN & ROLES
--     Dua level: admin (kelola konten + user) | editor (kelola konten saja)
-- ============================================================

CREATE TABLE roles (
  id   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE admins (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id       TINYINT UNSIGNED NOT NULL,
  name          VARCHAR(100) NOT NULL,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ============================================================
--  WAKTU SHOLAT LIMA WAKTU
--     Data diambil dari API equran.id lalu di-cache di sini.
--     Endpoint: GET https://equran.id/api/sholat/jadwal/{kota_id}/{tahun}/{bulan}
--     Jalankan job/cron bulanan untuk mengisi tabel ini.
-- ============================================================

CREATE TABLE prayer_times (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date          VARCHAR(10) NOT NULL,
  short_date    VARCHAR(10) DEFAULT NULL,
  long_date     DATE NOT NULL,
  day           VARCHAR(255) DEFAULT NULL,
  city          VARCHAR(100) NOT NULL,
  province      VARCHAR(100) NOT NULL,
  imsak         TIME NOT NULL,
  fajr          TIME NOT NULL,
  sunrise       TIME NOT NULL,
  dhuha         TIME NOT NULL,
  dhuhr         TIME NOT NULL,
  asr           TIME NOT NULL,
  maghrib       TIME NOT NULL,
  isha          TIME NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prayer_times_date_city (date, city)
);

-- ============================================================
--  JADWAL IMAM SHOLAT 5 WAKTU
--     Siklus berdasarkan waktu sholat 5 waktu (fajr, dhuhr, asr, maghrib, isha)
-- ============================================================

CREATE TABLE daily_prayer_schedules (
  pray_time  ENUM('fajr','dhuhr','asr','maghrib','isha') NOT NULL PRIMARY KEY,
  imam       VARCHAR(150) NOT NULL
);

-- ============================================================
--  JADWAL SHOLAT JUM'AT
--     Pasaran Jawa: siklus 5 hari (pon → wage → kliwon → legi → pahing)
--     Setiap baris = satu Jum'at, lengkap dengan petugas
-- ============================================================

CREATE TABLE jumat_schedules (
  pasaran  ENUM('pon','wage','kliwon','legi','pahing') NOT NULL PRIMARY KEY,
  imam     VARCHAR(150) NOT NULL,
  khotib   VARCHAR(150) NOT NULL,
  bilal    VARCHAR(150) NOT NULL
);

-- ============================================================
--  BLOG / BERITA (Markdown)
-- ============================================================

CREATE TABLE blog_categories (
  id        SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(120) NOT NULL UNIQUE,
  color_hex CHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_posts (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id SMALLINT UNSIGNED,
  admin_id    INT UNSIGNED NOT NULL,

  title       VARCHAR(300) NOT NULL,
  slug        VARCHAR(350) NOT NULL UNIQUE,
  excerpt     VARCHAR(500),

  content_md  LONGTEXT NOT NULL,

  cover_image_url VARCHAR(500),
  is_published    BOOLEAN  NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN  NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMP NULL,
  view_count      INT UNSIGNED NOT NULL DEFAULT 0,

  meta_title       VARCHAR(300),
  meta_description VARCHAR(500),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_post_category FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_post_admin    FOREIGN KEY (admin_id)    REFERENCES admins(id)
);

CREATE TABLE blog_tags (
  post_id BIGINT UNSIGNED NOT NULL,
  tag     VARCHAR(80)     NOT NULL,
  PRIMARY KEY (post_id, tag),
  CONSTRAINT fk_btag_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

-- ============================================================
--  EVENT / KEGIATAN MASJID
-- ============================================================

CREATE TABLE event_categories (
  id        SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(120) NOT NULL UNIQUE,
  color_hex CHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id SMALLINT UNSIGNED,
  admin_id    INT UNSIGNED NOT NULL,

  title          VARCHAR(300) NOT NULL,
  slug           VARCHAR(350) NOT NULL UNIQUE,
  description_md LONGTEXT,

  location_name   VARCHAR(200),
  location_detail TEXT,

  start_datetime DATETIME NOT NULL,
  end_datetime   DATETIME,
  is_all_day     BOOLEAN  NOT NULL DEFAULT FALSE,

  status          ENUM('draft','published','cancelled','completed') NOT NULL DEFAULT 'draft',
  cover_image_url VARCHAR(500),
  is_free         BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_event_category FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_event_admin    FOREIGN KEY (admin_id)    REFERENCES admins(id)
);

CREATE TABLE event_tags (
  event_id BIGINT UNSIGNED NOT NULL,
  tag      VARCHAR(80)     NOT NULL,
  PRIMARY KEY (event_id, tag),
  CONSTRAINT fk_etag_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ============================================================
--  KONTEN VIDEO
--     Mendukung: YouTube (panjang), YouTube Shorts, file lokal
-- ============================================================

CREATE TABLE video_categories (
  id        SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE videos (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id SMALLINT UNSIGNED,
  admin_id    INT UNSIGNED NOT NULL,

  title       VARCHAR(300) NOT NULL,
  slug        VARCHAR(350) NOT NULL UNIQUE,
  description TEXT,

  source_type ENUM('youtube','youtube_shorts','tiktok','local') NOT NULL,

  source_url       VARCHAR(500),

  platform_video_id VARCHAR(50),

  local_file_url   VARCHAR(500),

  thumbnail_url    VARCHAR(500),
  duration_seconds INT UNSIGNED,

  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMP NULL,
  view_count   INT UNSIGNED NOT NULL DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_video_category FOREIGN KEY (category_id) REFERENCES video_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_video_admin    FOREIGN KEY (admin_id)    REFERENCES admins(id),
  CONSTRAINT chk_video_source  CHECK (
    (source_type IN ('youtube','youtube_shorts','tiktok') AND platform_video_id IS NOT NULL)
    OR
    (source_type = 'local' AND local_file_url IS NOT NULL)
  )
);

CREATE TABLE video_tags (
  video_id BIGINT UNSIGNED NOT NULL,
  tag      VARCHAR(80)     NOT NULL,
  PRIMARY KEY (video_id, tag),
  CONSTRAINT fk_vtag_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- ============================================================
--  JWT refresh token
-- ============================================================
CREATE TABLE `refresh_tokens` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `admin_id` int(10) unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_revoked` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `refresh_tokens_admin_id_index` (`admin_id`),
  CONSTRAINT `refresh_tokens_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON UPDATE CASCADE
);

-- ============================================================
--  QUOTES / KUTIPAN INSPIRATIF
-- ============================================================

CREATE TABLE quote_categories (
  id        SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(120) NOT NULL UNIQUE,
  color_hex CHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotes (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id     SMALLINT UNSIGNED,
  admin_id        INT UNSIGNED NOT NULL,
  content         TEXT NOT NULL,
  source          VARCHAR(200),
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_quote_category FOREIGN KEY (category_id) REFERENCES quote_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_quote_admin    FOREIGN KEY (admin_id)    REFERENCES admins(id)
);

-- ============================================================
--  TOKOH INSPIRATIF
-- ============================================================

CREATE TABLE inspirational_figures (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id        INT UNSIGNED NOT NULL,
  name            VARCHAR(150) NOT NULL,
  title           VARCHAR(100),
  bio             TEXT,
  image_url       VARCHAR(500),
  birth_year      VARCHAR(10),
  death_year      VARCHAR(10),
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_figure_admin FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- ============================================================
--  POSTS / STATUS (Opini ala Facebook)
-- ============================================================

CREATE TABLE posts (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id        INT UNSIGNED NOT NULL,
  type            ENUM('opinion','quote_of_day','figure_spotlight') NOT NULL DEFAULT 'opinion',
  title           VARCHAR(300) NOT NULL,
  content         TEXT NOT NULL,
  quote_id        BIGINT UNSIGNED,
  figure_id       BIGINT UNSIGNED,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  view_count      INT UNSIGNED NOT NULL DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_admin FOREIGN KEY (admin_id) REFERENCES admins(id),
  CONSTRAINT fk_post_quote FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
  CONSTRAINT fk_post_figure FOREIGN KEY (figure_id) REFERENCES inspirational_figures(id) ON DELETE SET NULL
);

CREATE TABLE post_tags (
  post_id BIGINT UNSIGNED NOT NULL,
  tag     VARCHAR(80)     NOT NULL,
  PRIMARY KEY (post_id, tag),
  CONSTRAINT fk_ptag_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE post_reactions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id         BIGINT UNSIGNED NOT NULL,
  admin_id        INT UNSIGNED NOT NULL,
  reaction_type   ENUM('like','love','inspiring','pray') NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reaction_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_reaction_admin FOREIGN KEY (admin_id) REFERENCES admins(id),
  UNIQUE KEY uq_post_admin_reaction (post_id, admin_id, reaction_type)
);
