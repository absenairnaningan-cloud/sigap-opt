import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Bug, Sprout, Search } from 'lucide-react';

export const OPTKnowledgeBase: React.FC = () => {
  const [activeCommodity, setActiveCommodity] = useState('Padi');
  const [searchQuery, setSearchQuery] = useState('');

  const pestCatalog = [
    {
      commodity: 'Padi',
      name: 'Wereng Batang Coklat (Nilaparvata lugens)',
      type: 'Hama',
      symptoms: 'Daun menguning mulai dari bagian tepi dan pucuk, mengering seperti terbakar (hopperburn) melingkar di tengah hamparan, pangkal batang berlendir kecoklatan.',
      recommendation: 'Pergiliran varietas tahan wereng (Inpari 32, Inpari 42), pengeringan sawah berkala (intermittent), aplikasi agens hayati Beauveria bassiana saat nimfa awal, hindari pestisida piretroid sintetis yang memicu resurjensi.'
    },
    {
      commodity: 'Padi',
      name: 'Penyakit Blas (Pyricularia oryzae)',
      type: 'Penyakit',
      symptoms: 'Bercak berbentuk belah ketupat runcing di kedua ujung dengan pusat abu-abu atau keputihan pada daun; pada fase generatif menyebabkan leher malai membusuk patah (blas leher).',
      recommendation: 'Hindari penggunaan pupuk nitrogen (Urea) berlebih, beri asupan pupuk silika dan kalium, aplikasi fungisida biologi Trichoderma sp., semprot fungisida trisiklazol atau azoksistrobin pada fase bunting dan keluar malai.'
    },
    {
      commodity: 'Padi',
      name: 'Tikus Sawah (Rattus argentiventer)',
      type: 'Hama',
      symptoms: 'Tanaman terpotong rebah berserakan di hamparan sawah membentuk pola lingkaran acak dengan bekas potongan menyudut 45 derajat, lubang aktif di pematang utama.',
      recommendation: 'Gropyokan massal awal musim sebelum tanam bersama seluruh kelompok tani, pengemposan/fumigasi belerang pada lubang aktif, pemasangan TBS (Trap Barrier System), konservasi burung hantu (Tyto alba).'
    },
    {
      commodity: 'Jagung',
      name: 'Ulat Grayak FAW (Spodoptera frugiperda)',
      type: 'Hama',
      symptoms: 'Titik tumbuh / pupus tanaman muda berlubang robek compang-camping, banyak kotoran mirip serbuk gergaji (frass) di dalam pucuk daun.',
      recommendation: 'Aplikasi pestisida nabati mimba atau tembakau, aplikasi agens hayati Metarhizium anisopliae atau virus Spodoptera frugiperda MNPV, aplikasi insektisida emamektin benzoat tepat ke dalam corong pucuk tanaman.'
    },
    {
      commodity: 'Jagung',
      name: 'Penyakit Bulai (Peronosclerospora maydis)',
      type: 'Penyakit',
      symptoms: 'Garis-garis klorotik kuning sejajar tulang daun tanaman muda, pada pagi hari bagian bawah daun terdapat serbuk putih spora jamur, tanaman kerdil dan tongkol tidak terbentuk.',
      recommendation: 'Perlakuan benih (seed treatment) fungisida metalaksil atau dimetomorf sebelum tanam, tanam serentak dalam rentang 10 hari, musnahkan (eradikasi) tanaman bergejala bulai sedini mungkin.'
    },
    {
      commodity: 'Cabai',
      name: 'Antraknosa / Patek (Colletotrichum capsici)',
      type: 'Penyakit',
      symptoms: 'Bercak cekung melingkar basah kehitaman pada buah cabai, terdapat cincin konsentris spora oranye/hitam, buah gugur prematur dan membusuk kering.',
      recommendation: 'Sanitasi buah busuk dan jangan dibuang di parit, perbaiki drainase bedengan dengan mulsa plastik perak hitam, kurangi pupuk N, semprot fungisida tembaga hidroksida dan azoksistrobin bergantian.'
    }
  ];

  const filteredPests = pestCatalog.filter((p) => {
    const matchComm = activeCommodity === 'Semua' || p.commodity === activeCommodity;
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recommendation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchComm && matchQuery;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Panduan Standar Pengendalian Hama Terpadu (PHT)
            </h1>
            <p className="text-xs text-slate-500">
              Rujukan diagnosis gejala dan rekomendasi pengendalian resmi Dinas Pertanian
            </p>
          </div>
        </div>

        {/* Filter Tab & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2 overflow-x-auto text-xs font-semibold">
            {['Padi', 'Jagung', 'Cabai', 'Semua'].map((comm) => (
              <button
                key={comm}
                onClick={() => setActiveCommodity(comm)}
                className={`px-3.5 py-1.5 rounded-xl border transition ${
                  activeCommodity === comm
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {comm}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari hama, gejala, atau obat..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {filteredPests.map((pest, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    {pest.type === 'Hama' ? '🐛' : '🍄'}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{pest.name}</h3>
                    <span className="text-[11px] text-emerald-700 font-semibold">{pest.commodity} &bull; {pest.type}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">🔍 Gejala Serangan:</span>
                  <p className="text-slate-600 leading-relaxed">{pest.symptoms}</p>
                </div>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-1">💡 Rekomendasi PHT:</span>
                  <p className="text-emerald-800 leading-relaxed">{pest.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
