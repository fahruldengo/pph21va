// ====== MESIN PERHITUNGAN PPh 21 (PP 58/2023 - TER) ======

// Tabel PTKP setahun
const PTKP = {
  'TK/0':54000000,'TK/1':58500000,'TK/2':63000000,'TK/3':67500000,
  'K/0':58500000,'K/1':63000000,'K/2':67500000,'K/3':72000000,
  'K/I/0':112500000,'K/I/1':117000000,'K/I/2':121500000,'K/I/3':126000000
};

// Mapping status PTKP -> kategori TER
const TER_MAP = {
  'TK/0':'TER A','TK/1':'TER A','K/0':'TER A',
  'TK/2':'TER B','TK/3':'TER B','K/1':'TER B','K/2':'TER B',
  'K/3':'TER C','K/I/0':'TER C','K/I/1':'TER C','K/I/2':'TER C','K/I/3':'TER C'
};

// Tabel TER: { kategori: [[batasAtasBruto, tarif], ...] }
const TER_TABLE = {
  'TER A': [[5400000,0],[5650000,0.0025],[5950000,0.005],[6300000,0.0075],[6750000,0.01],[7500000,0.0125],[8550000,0.015],[9650000,0.0175],[10050000,0.02],[10350000,0.0225],[10700000,0.025],[11050000,0.03],[11600000,0.035],[12500000,0.04],[13750000,0.05],[15100000,0.06],[16950000,0.07],[19750000,0.08],[24150000,0.09],[26450000,0.1],[28000000,0.11],[30050000,0.12],[32400000,0.13],[35400000,0.14],[39100000,0.15],[43850000,0.16],[47800000,0.17],[51400000,0.18],[56300000,0.19],[62200000,0.2],[68600000,0.21],[77500000,0.22],[89000000,0.23],[103000000,0.24],[125000000,0.25],[157000000,0.26],[206000000,0.27],[337000000,0.28],[454000000,0.29],[550000000,0.3],[695000000,0.31],[910000000,0.32],[1400000000,0.33],[1e14,0.34]],
  'TER B': [[6200000,0],[6500000,0.0025],[6850000,0.005],[7300000,0.0075],[9200000,0.01],[10750000,0.015],[11250000,0.02],[11600000,0.025],[12600000,0.03],[13600000,0.04],[14950000,0.05],[16400000,0.06],[18450000,0.07],[21850000,0.08],[26000000,0.09],[27700000,0.1],[29350000,0.11],[31450000,0.12],[33950000,0.13],[37100000,0.14],[41100000,0.15],[45800000,0.16],[49500000,0.17],[53800000,0.18],[58500000,0.19],[64000000,0.2],[71000000,0.21],[80000000,0.22],[93000000,0.23],[109000000,0.24],[129000000,0.25],[163000000,0.26],[211000000,0.27],[374000000,0.28],[459000000,0.29],[555000000,0.3],[704000000,0.31],[957000000,0.32],[1405000000,0.33],[1e14,0.34]],
  'TER C': [[6600000,0],[6950000,0.0025],[7350000,0.005],[7800000,0.0075],[8850000,0.01],[9800000,0.0125],[10950000,0.015],[11200000,0.0175],[12050000,0.02],[12950000,0.03],[14150000,0.04],[15550000,0.05],[17050000,0.06],[19500000,0.07],[22700000,0.08],[26600000,0.09],[28100000,0.1],[30100000,0.11],[32600000,0.12],[35400000,0.13],[38900000,0.14],[43000000,0.15],[47400000,0.16],[51200000,0.17],[55800000,0.18],[60400000,0.19],[66700000,0.2],[74500000,0.21],[83200000,0.22],[95600000,0.23],[110000000,0.24],[134000000,0.25],[169000000,0.26],[221000000,0.27],[390000000,0.28],[463000000,0.29],[561000000,0.3],[709000000,0.31],[965000000,0.32],[1419000000,0.33],[1e14,0.34]]
};

// Lapisan tarif Pasal 17 (Desember / tahunan)
const PASAL17 = [
  [60000000,0.05],[250000000,0.15],[500000000,0.25],[5000000000,0.30],[Infinity,0.35]
];

const MONTHS = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];

function num(v){ const n = Number(v); return isNaN(n) ? 0 : n; }

// Cari tarif TER berdasarkan kategori & bruto bulanan
function tarifTER(kategori, bruto){
  const tbl = TER_TABLE[kategori] || TER_TABLE['TER A'];
  for (let i=0;i<tbl.length;i++){
    if (bruto <= tbl[i][0]) return tbl[i][1];
  }
  return tbl[tbl.length-1][1];
}

// Hitung penghasilan bruto sebulan
function hitungBruto(d){
  return num(d.gajiPokok)+num(d.tunjangan)+num(d.uangMakan)+num(d.uangLembur)
    +num(d.penghasilanLain)+num(d.tunjanganPph)+num(d.premiJkk)+num(d.premiJkm)
    +num(d.premiKes)+num(d.natura)+num(d.bonus)+num(d.thr)+num(d.tantiem);
}

// Pengurang (untuk metode Desember/tahunan)
function hitungPengurang(d){
  return num(d.iuranZakat)+num(d.iuranPensiun)+num(d.iuranJht);
}

// Biaya jabatan: 5% dari bruto, maks 6.000.000/tahun (500.000/bulan)
function biayaJabatan(brutoSetahun){
  return Math.min(0.05*brutoSetahun, 6000000);
}

// ===== PERHITUNGAN BULANAN (TER) Jan–Nov =====
function hitungBulananTER(d){
  const bruto = hitungBruto(d);
  const kategori = TER_MAP[d.statusPtkp] || 'TER A';
  const tarif = tarifTER(kategori, bruto);
  let pph = Math.round(bruto * tarif);
  if (d.punyaNpwp === 'TIDAK') pph = Math.round(pph * 1.2); // +20% tanpa NPWP
  return { bruto, pengurang:0, kategoriTer:kategori, tarifTer:tarif, pphTerutang:pph };
}

// ===== PERHITUNGAN DESEMBER (Pasal 17) =====
// pphSudahDipotong = total PPh Jan–Nov yang sudah dipotong (TER)
function hitungDesember(d, pphSudahDipotong){
  const brutoBulan = hitungBruto(d);
  const brutoSetahun = num(d.brutoSetahun) || brutoBulan; // total bruto setahun jika tersedia
  const biaJab = biayaJabatan(brutoSetahun);
  const penguranganTahunan = num(d.pengurangSetahun) || hitungPengurang(d);
  const netoSetahun = brutoSetahun - biaJab - penguranganTahunan;
  const ptkp = PTKP[d.statusPtkp] || PTKP['TK/0'];
  let pkp = Math.max(0, netoSetahun - ptkp);
  pkp = Math.floor(pkp/1000)*1000; // dibulatkan ke bawah ribuan penuh

  let pphSetahun = pasal17(pkp);
  if (d.punyaNpwp === 'TIDAK') pphSetahun = Math.round(pphSetahun * 1.2);

  const pphDesember = Math.round(pphSetahun - num(pphSudahDipotong));
  return {
    bruto: brutoBulan, brutoSetahun, biayaJabatan:biaJab, pengurang:penguranganTahunan,
    netoSetahun, ptkp, pkp, pphSetahun, pphSudahDipotong:num(pphSudahDipotong),
    kategoriTer:'PASAL 17', tarifTer:null, pphTerutang: pphDesember
  };
}

function pasal17(pkp){
  let sisa = pkp, pajak = 0, bawah = 0;
  for (const [batas, tarif] of PASAL17){
    if (pkp > bawah){
      const lapisan = Math.min(pkp, batas) - bawah;
      if (lapisan > 0) pajak += lapisan * tarif;
      bawah = batas;
    } else break;
  }
  return Math.round(pajak);
}

// Dispatcher utama
function hitungPPh(d, opts){
  opts = opts || {};
  if (d.bulan === 'DESEMBER' || d.metode === 'DESEMBER'){
    return hitungDesember(d, opts.pphSudahDipotong || 0);
  }
  return hitungBulananTER(d);
}

function rupiah(n){
  return 'Rp ' + (Math.round(num(n))).toLocaleString('id-ID');
}
