export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <title>Tentang Kami: SirojulAnam ConnectHub</title>

      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-emerald-800">Tentang Kami</h1>
          <p className="text-lg text-gray-600">
            Masjid Sirojul Anam Wonokerto - Tempat Ibadah & Pusat Dakwah
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-emerald-700">
              Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
            </h2>
            <p className="leading-relaxed text-justify">
              Puji syukur kehadirat Allah SWT yang telah meridhoi keberadaan Masjid Sirojul Anam sebagai tempat Ibadah, 
              pendidikan, dan dakwah di Desa Wonokerto. Dengan rahmat dan hidayah-NYA, kami terus berusaha memberikan 
              yang terbaik bagi umat Islam di lingkungan sekitar.
            </p>
          </section>

          <section className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-emerald-700">Visi</h2>
            <p className="leading-relaxed text-justify">
              Menjadi masjid yang terdepan dalam pelayanan Ibadah, pendidikan Islam, dan pemberdayaan umat 
              menuju masyarakat yang shaleh dan bermartabat.
            </p>
          </section>

          <section className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-emerald-700">Misi</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Menyelenggarakan Ibadah Sholat dengan nyaman dan khusyuk</li>
              <li>Mengembangkan pendidikan agama Islam untuk semua usia</li>
              <li>Menyediakan informasi kegiatan dan pengumuman masjid secara transparan</li>
              <li>Memperkuat ukhuwah Islamiyah di lingkungan masyarakat</li>
              <li>Melayani kebutuhan umat dengan penuh ikhlas dan profesional</li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-emerald-700">Program Unggulan</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Pengajian Umum Mingguan</li>
              <li>TPQ (Taman Pendidikan Al-Quran)</li>
              <li>Pengajian Remaja dan Pemuda</li>
              <li>Bakti Sosial</li>
              <li>Pelayanan Aqiqah dan Qurban</li>
            </ul>
          </section>

          <section className="rounded-2xl bg-emerald-50 p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-emerald-700">Hubungi Kami</h2>
            <p className="mb-4 leading-relaxed">
              Kami siap melayani Anda. Silakan hubungi kami melalui:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>Email: sirojulanamannam@gmail.com</p>
              <p>Telepon: +62 852-1934-2959</p>
              <p>Alamat: Jl. Pasucen-Lahar Km 02, Desa Pasucen RT 04/RW VI Kec. Trangkil, Kab. Pati 59153</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
