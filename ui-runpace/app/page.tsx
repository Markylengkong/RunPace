'use client';

import { useState } from 'react';

interface HasilAnalisis {
  tingkat_pengalaman: string;
  rekomendasi_pace: string;
  estimasi_durasi: string;
  total_detik: number;
}

export default function RunPaceDashboard() {
  // --- STATE PARAMETER INPUT ---
  const [jarakKm, setJarakKm] = useState<string>('5.0');
  const [elevasiM, setElevasiM] = useState<string>('25');
  const [gender, setGender] = useState<string>('M');
  const [jamLari, setJamLari] = useState<number>(6);
  const [heartRate, setHeartRate] = useState<string>('150');

  // --- STATE ENGINE UI ---
  const [loading, setLoading] = useState<boolean>(false);
  const [hasil, setHasil] = useState<HasilAnalisis | null>(null);

  // --- FUNGSI HITUNG Pace AI ---
  const hitungPaceAI = async () => {
    setLoading(true);
    const payload = {
      jarak_km: parseFloat(jarakKm) || 0,
      elevasi_m: parseFloat(elevasiM) || 0,
      gender: gender,
      jam_lari: jamLari,
      heart_rate: parseFloat(heartRate) || 0
    };

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setHasil(data.hasil);
      } else {
        alert('Gagal menghitung: ' + data.message);
      }
    } catch (error) {
      alert('Gagal terhubung ke server. Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getKastaBadgeColor = (kasta: string | undefined) => {
    if (kasta === 'Advanced') return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (kasta === 'Intermediate') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    return 'text-green-400 bg-green-500/10 border-green-500/30';
  };

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_100%)]">
      
      {/* HEADER */}
      <header className="mb-8 text-center md:text-left max-w-6xl mx-auto">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 mb-2">
          Vercel Production Environment
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500">
          🏃‍♂️ RunPace AI Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">Hybrid Machine Learning Predictive Engine Dashboard</p>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL KIRI: INPUT FORM */}
        <section className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl lg:col-span-1 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-5 text-green-400 border-b border-slate-800 pb-2 flex items-center gap-2">
              <span>🎛️</span> Parameter Sesi Lari
            </h2>
            
            <div className="space-y-5">
              {/* Jarak */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Target Jarak</label>
                  <span className="text-xs font-bold text-green-400">{jarakKm} KM</span>
                </div>
                <input type="number" value={jarakKm} onChange={(e) => setJarakKm(e.target.value)} step="0.1" min="0.1" className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-400 transition" />
              </div>

              {/* Elevasi */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Elevation Gain (Meter)</label>
                <input type="number" value={elevasiM} onChange={(e) => setElevasiM(e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-400 transition" />
              </div>

              {/* GENDER - SEKARANG BISA DIKLIK DAN BERUBAH WARNA */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Gender Fisiologis</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setGender('M')} className={`py-2.5 rounded-xl font-bold border transition text-sm cursor-pointer ${gender === 'M' ? 'bg-green-500/20 border-green-400 text-green-400 font-extrabold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                    ♂️ Laki-laki
                  </button>
                  <button type="button" onClick={() => setGender('F')} className={`py-2.5 rounded-xl font-bold border transition text-sm cursor-pointer ${gender === 'F' ? 'bg-green-500/20 border-green-400 text-green-400 font-extrabold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                    ♀️ Perempuan
                  </button>
                </div>
              </div>

              {/* SLIDER JAM LARI - ANGKA REAL-TIME BERUBAH DI SINI */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Waktu Sesi Lari</label>
                  <span className="text-xs font-bold bg-slate-800 px-2 py-0.5 rounded text-green-400 font-mono">
                    {jamLari < 10 ? `0${jamLari}` : jamLari}:00 ({5 <= jamLari && jamLari < 11 ? 'Pagi' : 11 <= jamLari && jamLari < 16 ? 'Siang' : 'Malam'})
                  </span>
                </div>
                <input type="range" min="0" max="23" value={jamLari} onChange={(e) => setJamLari(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-400 mt-2" />
              </div>

              {/* Heart Rate */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Rata-rata Heart Rate (BPM)</label>
                <input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-400 transition" />
              </div>
            </div>
          </div>

          {/* TOMBOL HITUNG SEKARANG AKTIF */}
          <button onClick={hitungPaceAI} disabled={loading} className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-green-500/10 hover:shadow-green-500/20 active:scale-[0.99] transition duration-150 cursor-pointer disabled:opacity-50 text-center uppercase tracking-wider text-sm">
            {loading ? '🔮 Mengalkulasi Data...' : 'Gass Hitung Pace AI 🚀'}
          </button>
        </section>

        {/* PANEL KANAN: OUTPUT CARDS */}
        <section className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 h-fit">
          
          <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 text-center shadow-lg flex flex-col justify-between min-h-[140px]">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Kasta Pelari (Classifier)</p>
            <div className="my-auto">
              <span className={`inline-block px-4 py-1.5 rounded-full text-base font-extrabold border ${getKastaBadgeColor(hasil?.tingkat_pengalaman)}`}>
                {hasil ? hasil.tingkat_pengalaman : 'BELUM ADA DATA'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Ditentukan otomatis oleh Model K-Means & RF</p>
          </div>

          <div className="bg-slate-900/30 backdrop-blur-md border border-green-500/20 rounded-2xl p-6 text-center shadow-lg flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-bl-full pointer-events-none group-hover:bg-green-500/10 transition"></div>
            <p className="text-xs font-bold uppercase text-green-400 tracking-wider">Rekomendasi Target Pace</p>
            <div className="text-4xl font-black my-auto font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
              {hasil ? hasil.rekomendasi_pace : '--:--'}
            </div>
            <p className="text-[10px] text-slate-400/70">Waktu konstan ideal per kilometer</p>
          </div>

          <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 text-center shadow-lg flex flex-col justify-between min-h-[140px]">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Estimasi Total Durasi</p>
            <div className="text-xl font-extrabold my-auto text-amber-400 tracking-tight">
              {hasil ? hasil.estimasi_durasi : '0 menit'}
            </div>
            <p className="text-[10px] text-slate-500">Prediksi waktu bersih sampai finish</p>
          </div>

          <div className="bg-slate-900/20 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 col-span-1 md:col-span-3 min-h-[280px] flex flex-col justify-between">
            <div className="border-b border-slate-800 pb-2 mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">💡 Insight & Logika Kalkulator AI</h3>
            </div>
            <div className="my-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                <p className="font-bold text-slate-200 mb-1">🏷️ Sistem Hibrida 3-Model:</p>
                Aplikasi memproses input kamu secara paralel. Karakteristik fisik dikelompokkan oleh K-Means, lalu diselaraskan menggunakan Random Forest Regressor untuk meminimalisir deviasi (error) waktu.
              </div>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                <p className="font-bold text-slate-200 mb-1">⚖️ Kalibrasi Fisiologis & Waktu:</p>
                Prediksi menyertakan pembobotan otomatis berbasis jam latihan (penurunan performa di siang hari) serta faktor pengali 1.08 khusus pelari perempuan demi akurasi medis.
              </div>
            </div>
            <div className="text-center text-[11px] text-slate-600 mt-4">
              Machine Learning Final Project • BINUS University Bandung
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}