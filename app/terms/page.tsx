"use client";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="w-[500px] h-[500px] bg-fuchsia-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto p-6 md:p-12">
        <a href="/" className="inline-block mb-8 text-fuchsia-400 hover:text-fuchsia-300 text-sm">
          ← Kembali ke Dashboard
        </a>

        <h1 className="text-3xl md:text-4xl font-black mb-2">Syarat dan Ketentuan</h1>
        <p className="text-white/40 text-sm mb-10">Terakhir diperbarui: 17 Juni 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Penerimaan Syarat</h2>
            <p>
              Dengan mengakses dan menggunakan platform AI Suite ("Layanan"), Anda menyetujui untuk
              terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan syarat ini,
              mohon untuk tidak menggunakan Layanan kami.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Deskripsi Layanan</h2>
            <p>
              AI Suite adalah platform yang menyediakan berbagai tools berbasis kecerdasan buatan
              (AI) untuk membantu pembuatan konten, termasuk namun tidak terbatas pada generate
              teks, gambar, video, dan suara. Layanan disediakan dalam paket Free, Pro, dan Premium
              dengan batasan penggunaan (quota) yang berbeda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Akun Pengguna</h2>
            <p>
              Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun dan password Anda.
              Anda setuju untuk memberikan informasi yang akurat saat mendaftar dan
              memperbaruinya jika terdapat perubahan. AI Suite berhak menangguhkan atau menghapus
              akun yang terindikasi melakukan pelanggaran, penyalahgunaan, atau aktivitas mencurigakan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Pembayaran dan Langganan</h2>
            <p>
              Pembayaran untuk paket Pro dan Premium diproses melalui mitra pembayaran resmi
              (Midtrans). Dengan melakukan pembayaran, Anda menyetujui bahwa biaya yang dibayarkan
              tidak dapat dikembalikan (non-refundable), kecuali ditentukan lain oleh kebijakan
              khusus yang berlaku. Langganan akan berlaku selama periode yang dibeli dan tidak
              otomatis diperpanjang kecuali dinyatakan sebaliknya.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Batasan Penggunaan (Quota)</h2>
            <p>
              Setiap paket memiliki batasan jumlah penggunaan (quota) harian sesuai dengan paket
              yang dipilih. Penggunaan di luar batas wajar, termasuk namun tidak terbatas pada
              automasi berlebihan, scraping, atau upaya membebani sistem, dapat menyebabkan
              penangguhan akun.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Konten yang Dihasilkan</h2>
            <p>
              Konten yang dihasilkan menggunakan tools AI Suite menjadi milik pengguna yang
              menghasilkannya, dengan catatan pengguna bertanggung jawab penuh atas penggunaan
              konten tersebut. AI Suite tidak bertanggung jawab atas keakuratan, legalitas, atau
              dampak dari konten yang dihasilkan oleh pengguna.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Larangan Penggunaan</h2>
            <p>Pengguna dilarang menggunakan Layanan untuk:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Membuat konten yang melanggar hukum, menyesatkan, atau berbahaya</li>
              <li>Menyebarkan kebencian, pelecehan, atau diskriminasi</li>
              <li>Melanggar hak kekayaan intelektual pihak lain</li>
              <li>Melakukan aktivitas yang merugikan sistem atau pengguna lain</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Perubahan Layanan</h2>
            <p>
              AI Suite berhak untuk mengubah, menangguhkan, atau menghentikan Layanan (sebagian
              atau seluruhnya) sewaktu-waktu dengan atau tanpa pemberitahuan sebelumnya.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Batasan Tanggung Jawab</h2>
            <p>
              Layanan disediakan "sebagaimana adanya" tanpa jaminan apapun. AI Suite tidak
              bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari
              penggunaan Layanan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Kontak</h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini, silakan hubungi
              kami melalui email yang tercantum di halaman dukungan platform.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}