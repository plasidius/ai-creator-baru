"use client";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="w-[500px] h-[500px] bg-violet-600 blur-[140px] rounded-full absolute top-[-100px] right-[-100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto p-6 md:p-12">
        <a href="/" className="inline-block mb-8 text-fuchsia-400 hover:text-fuchsia-300 text-sm">
          ← Kembali ke Dashboard
        </a>

        <h1 className="text-3xl md:text-4xl font-black mb-2">Kebijakan Privasi</h1>
        <p className="text-white/40 text-sm mb-10">Terakhir diperbarui: 27 Juni 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Informasi yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi berikut saat Anda menggunakan AI Suite:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Informasi akun: nama, alamat email, password (terenkripsi)</li>
              <li>Informasi login melalui Google (jika Anda memilih login dengan Google)</li>
              <li>Data penggunaan: jumlah generate, tools yang digunakan, riwayat aktivitas</li>
              <li>Informasi pembayaran yang diproses melalui mitra pembayaran (Midtrans), kami tidak menyimpan detail kartu kredit</li>
              <li>Prompt/teks yang Anda masukkan ke dalam tools AI untuk keperluan pemrosesan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Cara Kami Menggunakan Informasi</h2>
            <p>Informasi yang dikumpulkan digunakan untuk:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Menyediakan dan meningkatkan layanan AI Suite</li>
              <li>Memproses pembayaran dan mengelola langganan</li>
              <li>Mengirimkan notifikasi terkait akun (konfirmasi pembayaran, verifikasi email)</li>
              <li>Mendeteksi dan mencegah aktivitas penyalahgunaan atau penipuan</li>
              <li>Menganalisis penggunaan untuk pengembangan fitur baru</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Pembagian Informasi dengan Pihak Ketiga</h2>
            <p>Kami menggunakan layanan pihak ketiga berikut untuk operasional platform:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-white">Supabase</strong> — penyimpanan database dan autentikasi</li>
              <li><strong className="text-white">Midtrans</strong> — pemrosesan pembayaran</li>
              <li><strong className="text-white">Google OAuth</strong> — login menggunakan akun Google</li>
              <li><strong className="text-white">Anthropic / OpenAI</strong> — pemrosesan AI untuk generate konten teks</li>
              <li><strong className="text-white">Replicate</strong> — pemrosesan AI untuk generate gambar/video</li>
              <li><strong className="text-white">Resend</strong> — pengiriman email notifikasi</li>
              <li><strong className="text-white">Vercel</strong> — hosting dan infrastruktur platform</li>
            </ul>
            <p className="mt-2">
              Kami tidak menjual data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Keamanan Data</h2>
            <p>
              Kami menerapkan langkah-langkah keamanan termasuk Row Level Security (RLS) pada
              database, enkripsi password, dan reCAPTCHA untuk mencegah aktivitas bot/spam.
              Meskipun demikian, tidak ada sistem yang sepenuhnya aman, dan kami tidak dapat
              menjamin keamanan absolut atas data Anda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Penyimpanan Data</h2>
            <p>
              Data Anda disimpan selama akun Anda aktif. Jika Anda menghapus akun, kami akan
              menghapus data pribadi Anda dalam jangka waktu yang wajar, kecuali data yang wajib
              disimpan untuk kepentingan hukum atau pencatatan transaksi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Transfer Data Lintas Negara</h2>
            <p>
              Sebagian penyedia layanan pihak ketiga yang kami gunakan (seperti Anthropic, OpenAI,
              dan Replicate untuk pemrosesan AI) memproses data di server yang berlokasi di luar
              Indonesia. Dengan menggunakan Layanan, Anda menyetujui transfer data tersebut sesuai
              ketentuan dalam Undang-Undang Pelindungan Data Pribadi (UU PDP) yang berlaku, dan kami
              berupaya memastikan mitra kami menerapkan standar keamanan data yang memadai.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Hak Pengguna</h2>
            <p>Anda memiliki hak untuk:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Mengakses dan memperbarui informasi akun Anda</li>
              <li>Meminta penghapusan akun dan data pribadi Anda</li>
              <li>Menarik persetujuan penggunaan data (dengan konsekuensi tidak dapat menggunakan layanan)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Cookie</h2>
            <p>
              Kami menggunakan cookie untuk menjaga sesi login Anda dan meningkatkan pengalaman
              penggunaan platform. Anda dapat menonaktifkan cookie melalui pengaturan browser,
              namun ini dapat memengaruhi fungsi platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Perubahan Kebijakan</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan
              diinformasikan melalui platform atau email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Kontak</h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami
              melalui email{" "}
              <a href="mailto:plasidius7@gmail.com" className="text-fuchsia-400 hover:underline">
                plasidius7@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}