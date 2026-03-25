import "dotenv/config";
import { initEntityManager } from "./lib/entityManager.ts";
import { Roles } from "./entities/Roles.ts";
import { Admins } from "./entities/Admins.ts";
import { PrayerTimes } from "./entities/PrayerTimes.ts";
import { DailyPrayerSchedule, PrayTime } from "./entities/DailyPrayerSchedule.ts";
import { JumatSchedules, JumatSchedulesPasaran } from "./entities/JumatSchedules.ts";
import { BlogCategories } from "./entities/BlogCategories.ts";
import { BlogPosts } from "./entities/BlogPosts.ts";
import { EventCategories } from "./entities/EventCategories.ts";
import { Events, EventsStatus } from "./entities/Events.ts";
import { VideoCategories } from "./entities/VideoCategories.ts";
import { Videos, VideosSourceType } from "./entities/Videos.ts";
import { hashPassword } from "./utils/hash.ts";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function generatePrayerTime(date: Date, city: string, province: string) {
  const dateStr = date.toISOString().split("T")[0];
  const dayName = DAY_NAMES[date.getDay()];
  const baseTimes = [
    { imsak: "04:15", fajr: "04:25", sunrise: "05:40", dhuha: "06:00", dhuhr: "11:45", asr: "15:00", maghrib: "17:45", isha: "18:55" },
    { imsak: "04:16", fajr: "04:26", sunrise: "05:41", dhuha: "06:01", dhuhr: "11:45", asr: "15:00", maghrib: "17:45", isha: "18:55" },
    { imsak: "04:17", fajr: "04:27", sunrise: "05:42", dhuha: "06:02", dhuhr: "11:45", asr: "15:00", maghrib: "17:44", isha: "18:54" },
    { imsak: "04:18", fajr: "04:28", sunrise: "05:43", dhuha: "06:03", dhuhr: "11:45", asr: "15:00", maghrib: "17:44", isha: "18:54" },
    { imsak: "04:19", fajr: "04:29", sunrise: "05:44", dhuha: "06:04", dhuhr: "11:45", asr: "15:00", maghrib: "17:43", isha: "18:53" },
    { imsak: "04:20", fajr: "04:30", sunrise: "05:45", dhuha: "06:05", dhuhr: "11:45", asr: "15:00", maghrib: "17:43", isha: "18:53" },
    { imsak: "04:21", fajr: "04:31", sunrise: "05:46", dhuha: "06:06", dhuhr: "11:45", asr: "15:00", maghrib: "17:42", isha: "18:52" },
  ];
  const timeVariation = baseTimes[date.getDate() % baseTimes.length];
  return { date: dateStr, shortDate: dateStr, longDate: date, day: dayName, city, province, ...timeVariation };
}

async function seed() {
  const orm = await initEntityManager();
  const em = orm.em.fork();

  console.log("🌱 Starting seed...");

  // ─── Roles ─────────────────────────────────────────────────────
  let managerRole = await em.findOne(Roles, { name: "manager" });
  if (!managerRole) {
    managerRole = new Roles();
    managerRole.name = "manager";
    em.persist(managerRole);
    await em.flush();
    console.log("✅ Created role: manager");
  }

  let editorRole = await em.findOne(Roles, { name: "editor" });
  if (!editorRole) {
    editorRole = new Roles();
    editorRole.name = "editor";
    em.persist(editorRole);
    await em.flush();
    console.log("✅ Created role: editor");
  }

  // ─── Admin ─────────────────────────────────────────────────────
  const existingAdmin = await em.findOne(Admins, { email: "admin@sirojulanam.org" });
  let admin: Admins;
  if (!existingAdmin) {
    admin = new Admins();
    admin.name = "Administrator";
    admin.username = "admin";
    admin.email = "admin@sirojulanam.org";
    admin.passwordHash = await hashPassword("admin123");
    admin.role = managerRole!;
    admin.isActive = true;
    em.persist(admin);
    await em.flush();
    console.log("✅ Created admin: admin@sirojulanam.org / admin123");
  } else {
    admin = existingAdmin;
    console.log("ℹ️  Admin already exists");
  }

  // ─── Prayer Times (full month) ────────────────────────────────
  const city = "Pati";
  const province = "Jawa Tengah";
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dateStr = date.toISOString().split("T")[0];
    const existing = await em.findOne(PrayerTimes, { date: dateStr, city });
    if (!existing) {
      const prayerData = generatePrayerTime(date, city, province);
      const prayer = new PrayerTimes();
      Object.assign(prayer, prayerData);
      em.persist(prayer);
    }
  }
  await em.flush();
  console.log(`✅ Prayer times seeded (${daysInMonth} days)`);

  // ─── Daily Prayer Schedules (Imam 5 Waktu) ─────────────────────────────────────────
  const dailyPrayerData = [
    { prayTime: PrayTime.FAJR, imam: "Ust. Ahmad Fauzi" },
    { prayTime: PrayTime.DHUHR, imam: "Ust. Budi Santoso" },
    { prayTime: PrayTime.ASR, imam: "Ust. Cahyo Nur" },
    { prayTime: PrayTime.MAGHRIB, imam: "Ust. Dedi Kurniawan" },
    { prayTime: PrayTime.ISHA, imam: "Ust. Eko Prasetyo" },
  ];

  for (const data of dailyPrayerData) {
    const existing = await em.findOne(DailyPrayerSchedule, { prayTime: data.prayTime });
    if (!existing) {
      const schedule = new DailyPrayerSchedule();
      schedule.prayTime = data.prayTime;
      schedule.imam = data.imam;
      em.persist(schedule);
    }
  }
  await em.flush();
  console.log("✅ Daily prayer schedules seeded (5 times)");

  // ─── Jumat Schedules ─────────────────────────────────────────
  const jumatData = [
    { pasaran: JumatSchedulesPasaran.PON, imam: "KH. Ahmad Syafii", khotib: "KH. Ahmad Syafii", bilal: "Budi Santoso" },
    { pasaran: JumatSchedulesPasaran.WAGE, imam: "KH. Muhaimin", khotib: "KH. Muhaimin", bilal: "Ahmad Fauzi" },
    { pasaran: JumatSchedulesPasaran.KLIWON, imam: "KH. Nur Hadi", khotib: "KH. Nur Hadi", bilal: "Dedi Kurniawan" },
    { pasaran: JumatSchedulesPasaran.LEGI, imam: "KH. Abdul Rahman", khotib: "KH. Abdul Rahman", bilal: "Eko Prasetyo" },
    { pasaran: JumatSchedulesPasaran.PAHING, imam: "KH. Solikhin", khotib: "KH. Solikhin", bilal: "Fajar Nugroho" },
  ];

  for (const data of jumatData) {
    const existing = await em.findOne(JumatSchedules, { pasaran: data.pasaran });
    if (!existing) {
      const jumat = new JumatSchedules();
      jumat.pasaran = data.pasaran;
      jumat.imam = data.imam;
      jumat.khotib = data.khotib;
      jumat.bilal = data.bilal;
      em.persist(jumat);
    }
  }
  await em.flush();
  console.log("✅ Jumat schedules seeded (5 pasaran)");

  // ─── Blog Categories ─────────────────────────────────────────
  const blogCatData = [
    { name: "Kajian", slug: "kajian", colorHex: "#22c55e" },
    { name: "Pengumuman", slug: "pengumuman", colorHex: "#3b82f6" },
    { name: "Artikel", slug: "artikel", colorHex: "#f59e0b" },
    { name: "Tausiyah", slug: "tausiyah", colorHex: "#8b5cf6" },
  ];

  const blogCategories: BlogCategories[] = [];
  for (const data of blogCatData) {
    let cat = await em.findOne(BlogCategories, { slug: data.slug });
    if (!cat) {
      cat = new BlogCategories();
      cat.name = data.name;
      cat.slug = data.slug;
      cat.colorHex = data.colorHex;
      em.persist(cat);
    }
    blogCategories.push(cat);
  }
  await em.flush();
  console.log("✅ Blog categories seeded");

  // ─── Blog Posts ──────────────────────────────────────────────
  const blogPosts = [
    { title: "Keutamaan Sholat Berjamaah di Masjid", catIdx: 0, excerpt: "Sholat berjamaah memiliki keutamaan yang sangat besar dalam Islam, 27 derajat lebih utama dari sholat sendirian." },
    { title: "Jadwal Kajian Rutin Mingguan", catIdx: 1, excerpt: "Kajian rutin setiap malam Jumat setelah Maghrib di Masjid Sirojul Anam dengan tema berganti setiap pekan." },
    { title: "Tips Memperbanyak Ibadah di Bulan Ramadhan", catIdx: 2, excerpt: "Bulan Ramadhan adalah bulan penuh berkah. Berikut tips untuk memperbanyak ibadah di bulan suci ini." },
    { title: "Pentingnya Menuntut Ilmu dalam Islam", catIdx: 3, excerpt: "Menuntut ilmu adalah kewajiban bagi setiap muslim, baik laki-laki maupun perempuan." },
    { title: "Penggalangan Dana untuk Renovasi Masjid", catIdx: 1, excerpt: "Mari bersama-sama berpartisipasi dalam renovasi Masjid Sirojul Anam untuk kenyamanan jamaah." },
  ];

  for (let i = 0; i < blogPosts.length; i++) {
    const data = blogPosts[i];
    const slug = generateSlug(data.title);
    const existing = await em.findOne(BlogPosts, { slug });
    if (!existing) {
      const post = new BlogPosts();
      post.title = data.title;
      post.slug = slug;
      post.excerpt = data.excerpt;
      post.contentMd = `<p>${data.excerpt}</p><p>Alhamdulillah, semoga artikel ini bermanfaat bagi kita semua. Mari kita tingkatkan ibadah dan keimanan kita kepada Allah SWT.</p>`;
      post.category = blogCategories[data.catIdx];
      post.admin = admin;
      post.isPublished = true;
      post.publishedAt = new Date(Date.now() - (blogPosts.length - i) * 86400000);
      post.viewCount = Math.floor(Math.random() * 100);
      em.persist(post);
    }
  }
  await em.flush();
  console.log("✅ Blog posts seeded");

  // ─── Event Categories ───────────────────────────────────────
  const eventCatData = [
    { name: "Kajian", slug: "kajian", colorHex: "#22c55e" },
    { name: "Pengajian", slug: "pengajian", colorHex: "#3b82f6" },
    { name: "Sosial", slug: "sosial", colorHex: "#f59e0b" },
  ];

  const eventCategories: EventCategories[] = [];
  for (const data of eventCatData) {
    let cat = await em.findOne(EventCategories, { slug: data.slug });
    if (!cat) {
      cat = new EventCategories();
      cat.name = data.name;
      cat.slug = data.slug;
      cat.colorHex = data.colorHex;
      em.persist(cat);
    }
    eventCategories.push(cat);
  }
  await em.flush();
  console.log("✅ Event categories seeded");

  // ─── Events ─────────────────────────────────────────────────
  const events = [
    { title: "Kajian Rutin Malam Jumat", catIdx: 0, desc: "Kajian rutin setiap malam Jumat setelah Maghrib dengan tema berganti setiap minggu.", startOffset: 1 },
    { title: "Pengajian Akbar Hari Besar Islam", catIdx: 1, desc: "Pengajian akbar dalam rangka memperingati Hari Besar Islam dengan penceramah dari luar daerah.", startOffset: 7 },
    { title: "Bakti Sosial Ramadhan", catIdx: 2, desc: "Kegiatan bakti sosial berupa pembagian sembako dan takjil gratis untuk masyarakat sekitar.", startOffset: 14 },
    { title: "Santunan Anak Yatim", catIdx: 2, desc: "Kegiatan santunan untuk anak-anak yatim di lingkungan masjid.", startOffset: 21 },
  ];

  for (const data of events) {
    const slug = generateSlug(data.title);
    const existing = await em.findOne(Events, { slug });
    if (!existing) {
      const event = new Events();
      event.title = data.title;
      event.slug = slug;
      event.descriptionMd = `<p>${data.desc}</p>`;
      event.locationName = "Masjid Sirojul Anam";
      event.locationDetail = "Dukuh Wonokerto, Pasucen, Trangkil, Pati";
      event.startDatetime = new Date(Date.now() + data.startOffset * 86400000);
      event.endDatetime = new Date(Date.now() + data.startOffset * 86400000 + 7200000);
      event.isAllDay = false;
      event.status = EventsStatus.PUBLISHED;
      event.isFree = true;
      event.category = eventCategories[data.catIdx];
      event.admin = admin;
      em.persist(event);
    }
  }
  await em.flush();
  console.log("✅ Events seeded");

  // ─── Video Categories ──────────────────────────────────────
  const videoCatData = [
    { name: "Khutbah Jumat", slug: "khutbah-jumat" },
    { name: "Kajian", slug: "kajian" },
    { name: "Tilawah", slug: "tilawah" },
  ];

  const videoCategories: VideoCategories[] = [];
  for (const data of videoCatData) {
    let cat = await em.findOne(VideoCategories, { slug: data.slug });
    if (!cat) {
      cat = new VideoCategories();
      cat.name = data.name;
      cat.slug = data.slug;
      em.persist(cat);
    }
    videoCategories.push(cat);
  }
  await em.flush();
  console.log("✅ Video categories seeded");

  // ─── Videos ─────────────────────────────────────────────────
  const videos = [
    { title: "Khutbah Jumat: Pentingnya Silaturahmi", catIdx: 0, type: VideosSourceType.YOUTUBE, vidId: "dQw4w9WgXcQ", duration: 1200 },
    { title: "Kajian Tafsir Surat Al-Fatihah", catIdx: 1, type: VideosSourceType.YOUTUBE, vidId: "dQw4w9WgXcQ", duration: 3600 },
    { title: "Tilawah Quran Merdu - Juz 30", catIdx: 2, type: VideosSourceType.YOUTUBE, vidId: "dQw4w9WgXcQ", duration: 2400 },
    { title: "Kajian Fiqh: Hukum Puasa Senin Kamis", catIdx: 1, type: VideosSourceType.YOUTUBE, vidId: "dQw4w9WgXcQ", duration: 1800 },
  ];

  for (const data of videos) {
    const slug = generateSlug(data.title);
    const existing = await em.findOne(Videos, { slug });
    if (!existing) {
      const video = new Videos();
      video.title = data.title;
      video.slug = slug;
      video.description = `Video ${data.title} dari Masjid Sirojul Anam Wonokerto, Pati.`;
      video.sourceType = data.type;
      video.sourceUrl = `https://www.youtube.com/watch?v=${data.vidId}`;
      video.platformVideoId = data.vidId;
      video.thumbnailUrl = `https://img.youtube.com/vi/${data.vidId}/0.jpg`;
      video.durationSeconds = data.duration;
      video.isPublished = true;
      video.publishedAt = new Date(Date.now() - Math.random() * 86400000 * 7);
      video.viewCount = Math.floor(Math.random() * 200);
      video.category = videoCategories[data.catIdx];
      video.admin = admin;
      em.persist(video);
    }
  }
  await em.flush();
  console.log("✅ Videos seeded");

  console.log("🎉 Seed completed!");
  await orm.close(true);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
