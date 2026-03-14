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
  name VARCHAR(30) NOT NULL UNIQUE   -- 'admin' | 'editor'
);

CREATE TABLE admins (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id       TINYINT UNSIGNED NOT NULL,
  name          VARCHAR(100) NOT NULL,
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
  short_date    INT DEFAULT NULL,
  long_date     DATE NOT NULL,
  day           VARCHAR(255),
  imsak         TIME NOT NULL,
  fajr          TIME NOT NULL,   -- Subuh
  sunrise       TIME NOT NULL,   -- Terbit
  dhuha         TIME NOT NULL,   -- Dhuha
  dhuhr         TIME NOT NULL,   -- Dzuhur
  asr           TIME NOT NULL,   -- Ashar
  maghrib       TIME NOT NULL,   -- Maghrib
  isha          TIME NOT NULL,   -- Isya
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prayer_date (date)
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
  bilal    VARCHAR(150) NOT NULL,
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

  -- Konten utama dalam format Markdown
  -- Gambar di-embed langsung via path/URL di dalam teks MD
  content_md  LONGTEXT NOT NULL,

  cover_image_url VARCHAR(500),
  is_published    BOOLEAN  NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN  NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMP NULL,
  view_count      INT UNSIGNED NOT NULL DEFAULT 0,

  -- SEO
  meta_title       VARCHAR(300),
  meta_description VARCHAR(500),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_post_category FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_post_admin    FOREIGN KEY (admin_id)    REFERENCES admins(id),

  FULLTEXT INDEX ft_post (title, excerpt, content_md)
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
  registration_url VARCHAR(500),  -- link Google Form dsb. (opsional)

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

  -- Tipe sumber video
  source_type ENUM('youtube','youtube_shorts','tiktok','local') NOT NULL,

  -- URL asli yang di-paste user di halaman admin
  -- Disimpan agar bisa re-ekstrak ulang jika format URL berubah di masa depan
  source_url       VARCHAR(500),

  -- Hasil ekstrak backend dari source_url
  -- YouTube/Shorts : video_id 11 karakter  (contoh: dQw4w9WgXcQ)
  -- TikTok         : video_id numerik panjang (contoh: 7318754892052184337)
  platform_video_id VARCHAR(50),

  -- Untuk video lokal: path / URL file di server atau storage bucket
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
--  SEED DATA AWAL
-- ============================================================

INSERT INTO roles (name) VALUES ('admin'), ('editor');

INSERT INTO blog_categories (name, slug, color_hex) VALUES
  ('Artikel Islam', 'artikel-islam', '#10B981'),
  ('Kegiatan',      'kegiatan',      '#3B82F6'),
  ('Pengumuman',    'pengumuman',    '#F59E0B');

INSERT INTO event_categories (name, slug, color_hex) VALUES
  ('Kajian',          'kajian',          '#8B5CF6'),
  ('Taklim',          'taklim',          '#06B6D4'),
  ('Sosial',          'sosial',          '#EF4444'),
  ('Peringatan Hari', 'peringatan-hari', '#F97316');

INSERT INTO video_categories (name, slug) VALUES
  ('Kajian Rutin',    'kajian-rutin'),
  ('Khutbah Jum\'at', 'khutbah-jumat'),
  ('Ceramah Umum',    'ceramah-umum'),
  ('Shorts / Clip',   'shorts-clip');

-- Contoh jadwal Jum'at (sesuaikan tanggal & petugas aktual)
INSERT INTO jumat_schedules (date, pasaran, time, imam, khotib, bilal) VALUES
  ('2025-03-07', 'pon',    '11:30:00', 'Ust. Ahmad',  'Ust. Budi',   'Pak Cahyo'),
  ('2025-03-14', 'wage',   '11:30:00', 'Ust. Budi',   'Ust. Dani',   'Pak Eko'),
  ('2025-03-21', 'kliwon', '11:30:00', 'Ust. Dani',   'Ust. Ahmad',  'Pak Fajar'),
  ('2025-03-28', 'legi',   '11:30:00', 'Ust. Fajar',  'Ust. Cahyo',  'Pak Ahmad'),
  ('2025-04-04', 'pahing', '11:30:00', 'Ust. Cahyo',  'Ust. Fajar',  'Pak Budi');

-- Contoh jadwal sholat 5 waktu
INSERT INTO daily_prayer_schedules (pray_time, imam) VALUES
  ('fajr',    'Ust. Ahmad'),
  ('dhuhr',   'Ust. Budi'),
  ('asr',     'Ust. Budi'),
  ('maghrib', 'Ust. Dani'),
  ('isha',    'Ust. Dani');
