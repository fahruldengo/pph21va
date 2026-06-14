// ====== APP LOGIC ======
const App = (function(){
  let employees = [];
  const PTKP_OPTS = Object.keys(PTKP);

  function $(id){ return document.getElementById(id); }
  function val(id){ return $(id) ? $(id).value : ''; }
  function setVal(id,v){ if($(id)) $(id).value = v; }

  function toast(msg, isErr){
    const t = $('toast');
    t.textContent = msg;
    t.className = 'toast show' + (isErr?' err':'');
    setTimeout(()=>{ t.className = 'toast'; }, 3000);
  }

  function fillSelect(id, opts, keep){
    const el = $(id); if(!el) return;
    const cur = keep ? el.value : null;
    el.innerHTML = '';
    opts.forEach(o=>{
      const op = document.createElement('option');
      if (typeof o === 'object'){ op.value=o.value; op.textContent=o.label; }
      else { op.value=o; op.textContent=o; }
      el.appendChild(op);
    });
    if (cur) el.value = cur;
  }

  function pillTer(k){
    const map={'TER A':'pill-a','TER B':'pill-b','TER C':'pill-c','PASAL 17':'pill-p'};
    return '<span class="pill '+(map[k]||'pill-a')+'">'+(k||'-')+'</span>';
  }

  // ---------- INIT ----------
  async function init(){
    // populate selects
    [['c_ptkp'],['e_statusPtkp']].forEach(([id])=>fillSelect(id, PTKP_OPTS));
    fillSelect('c_bulan', MONTHS);
    fillSelect('r_bulan', MONTHS);
    fillSelect('bp_bulan', MONTHS);

    // tabs
    document.querySelectorAll('nav button').forEach(b=>{
      b.onclick=()=>{
        document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        document.querySelectorAll('main > section').forEach(s=>s.style.display='none');
        $('tab-'+b.dataset.tab).style.display='block';
      };
    });

    // bulan -> tampilkan extra Desember
    $('c_bulan').onchange = ()=>{
      $('c_decExtra').style.display = (val('c_bulan')==='DESEMBER')?'block':'none';
    };

    // pilih karyawan di kalkulator -> autofill identitas
    $('c_emp').onchange = ()=>{
      const e = employees.find(x=>String(x.id)===val('c_emp'));
      if (e){
        setVal('c_nama', e.nama);
        setVal('c_ptkp', e.statusPtkp || 'TK/0');
        setVal('c_npwp', e.punyaNpwp || 'YA');
      }
    };

    await checkConn();
    await loadEmployees();
  }

  async function checkConn(){
    const s = $('connStatus');
    try{ await API.ping(); s.textContent='Terhubung'; s.className='status ok'; }
    catch(e){ s.textContent='Gagal terhubung'; s.className='status err'; toast(e.message, true); }
  }

  // ---------- KARYAWAN ----------
  async function loadEmployees(){
    try{
      employees = await API.getEmployees() || [];
      renderEmpList();
      const opts = [{value:'',label:'— Manual / pilih karyawan —'}]
        .concat(employees.map(e=>({value:e.id,label:e.nama})));
      fillSelect('c_emp', opts);
      fillSelect('bp_emp', employees.map(e=>({value:e.id,label:e.nama})));
    }catch(e){ toast(e.message, true); }
  }

  function renderEmpList(){
    const box = $('empList');
    if (!employees.length){ box.innerHTML='<div class="empty">Belum ada data karyawan.</div>'; return; }
    let h='<table><thead><tr><th>Nama</th><th>NIK</th><th>NPWP</th><th>PTKP</th><th>Jabatan</th><th>Status</th><th></th></tr></thead><tbody>';
    employees.forEach(e=>{
      h+=`<tr>
        <td>${e.nama||''}</td><td>${e.nik||''}</td>
        <td>${e.punyaNpwp==='TIDAK'?'<span class="muted">Tidak</span>':(e.npwp||'')}</td>
        <td>${e.statusPtkp||''}</td><td>${e.jabatan||''}</td><td>${e.aktif||''}</td>
        <td class="row no-print">
          <button class="btn btn-ghost btn-sm" onclick="App.editKaryawan('${e.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="App.hapusKaryawan('${e.id}')">Hapus</button>
        </td></tr>`;
    });
    box.innerHTML = h+'</tbody></table>';
  }

  function editKaryawan(id){
    const e = employees.find(x=>String(x.id)===String(id)); if(!e) return;
    setVal('e_id',e.id); setVal('e_nama',e.nama); setVal('e_nik',e.nik); setVal('e_npwp',e.npwp);
    setVal('e_punyaNpwp',e.punyaNpwp||'YA'); setVal('e_statusPtkp',e.statusPtkp||'TK/0');
    setVal('e_jenisKelamin',e.jenisKelamin||'Laki-laki'); setVal('e_jabatan',e.jabatan);
    setVal('e_aktif',e.aktif||'AKTIF');
    document.querySelector('nav button[data-tab="emp"]').click();
    window.scrollTo(0,0);
  }

  async function simpanKaryawan(){
    const emp = {
      id: val('e_id') || null, nama: val('e_nama'), nik: val('e_nik'), npwp: val('e_npwp'),
      punyaNpwp: val('e_punyaNpwp'), statusPtkp: val('e_statusPtkp'),
      jenisKelamin: val('e_jenisKelamin'), jabatan: val('e_jabatan'), aktif: val('e_aktif')
    };
    if (!emp.nama){ toast('Nama wajib diisi', true); return; }
    try{ await API.saveEmployee(emp); toast('Karyawan tersimpan'); resetEmp(); await loadEmployees(); }
    catch(e){ toast(e.message, true); }
  }

  async function hapusKaryawan(id){
    if(!confirm('Hapus karyawan ini?')) return;
    try{ await API.deleteEmployee(id); toast('Karyawan dihapus'); await loadEmployees(); }
    catch(e){ toast(e.message, true); }
  }

  function resetEmp(){
    ['e_id','e_nama','e_nik','e_npwp','e_jabatan'].forEach(i=>setVal(i,''));
    setVal('e_punyaNpwp','YA'); setVal('e_statusPtkp','TK/0'); setVal('e_aktif','AKTIF');
  }

  // ---------- KALKULATOR ----------
  function gatherCalc(){
    return {
      employeeId: val('c_emp'), nama: val('c_nama'), statusPtkp: val('c_ptkp'),
      punyaNpwp: val('c_npwp'), tahun: val('c_tahun'), bulan: val('c_bulan'),
      gajiPokok:val('c_gajiPokok'), tunjangan:val('c_tunjangan'), uangMakan:val('c_uangMakan'),
      uangLembur:val('c_uangLembur'), penghasilanLain:val('c_penghasilanLain'), tunjanganPph:val('c_tunjanganPph'),
      premiJkk:val('c_premiJkk'), premiJkm:val('c_premiJkm'), premiKes:val('c_premiKes'), natura:val('c_natura'),
      bonus:val('c_bonus'), thr:val('c_thr'), tantiem:val('c_tantiem'),
      iuranZakat:val('c_iuranZakat'), iuranPensiun:val('c_iuranPensiun'), iuranJht:val('c_iuranJht'),
      brutoSetahun:val('c_brutoSetahun'), pengurangSetahun:val('c_pengurangSetahun')
    };
  }

  let lastResult = null;

  function hitung(){
    const d = gatherCalc();
    if (!d.nama){ toast('Isi nama / pilih karyawan', true); return; }
    const opts = { pphSudahDipotong: num(val('c_pphDipotong')) };
    const r = hitungPPh(d, opts);
    lastResult = Object.assign({}, d, r);

    let html = '';
    const isDes = (d.bulan==='DESEMBER');
    if (isDes){
      html += line('Bruto Bulan Desember', rupiah(r.bruto));
      html += line('Bruto Setahun', rupiah(r.brutoSetahun));
      html += line('Biaya Jabatan', rupiah(r.biayaJabatan));
      html += line('Pengurang', rupiah(r.pengurang));
      html += line('Neto Setahun', rupiah(r.netoSetahun));
      html += line('PTKP ('+d.statusPtkp+')', rupiah(r.ptkp));
      html += line('PKP', rupiah(r.pkp));
      html += line('PPh Setahun (Pasal 17)', rupiah(r.pphSetahun));
      html += line('PPh sudah dipotong Jan–Nov', rupiah(r.pphSudahDipotong));
      html += line('Metode', pillTer('PASAL 17'));
    } else {
      html += line('Penghasilan Bruto Sebulan', rupiah(r.bruto));
      html += line('Kategori TER', pillTer(r.kategoriTer));
      html += line('Tarif Efektif (TER)', (r.tarifTer*100).toFixed(2).replace('.',',')+'%');
      if (d.punyaNpwp==='TIDAK') html += line('Penyesuaian tanpa NPWP', '+20%');
    }
    html += `<div class="result-row total"><span>PPh Pasal 21 ${isDes?'Desember':'Terutang'}</span><span>${rupiah(r.pphTerutang)}</span></div>`;
    $('c_result').innerHTML = html;
    $('c_result').style.display = 'block';
    $('c_save').style.display = 'inline-block';
  }

  function line(label, value){
    return `<div class="result-row"><span>${label}</span><span>${value}</span></div>`;
  }

  async function simpanRecord(){
    if (!lastResult){ toast('Hitung dulu sebelum simpan', true); return; }
    const r = lastResult;
    const rec = {
      employeeId:r.employeeId, nama:r.nama, statusPtkp:r.statusPtkp, tahun:r.tahun, bulan:r.bulan,
      metode: r.bulan==='DESEMBER'?'DESEMBER':'TER',
      gajiPokok:num(r.gajiPokok), tunjangan:num(r.tunjangan), uangMakan:num(r.uangMakan),
      uangLembur:num(r.uangLembur), penghasilanLain:num(r.penghasilanLain), tunjanganPph:num(r.tunjanganPph),
      premiJkk:num(r.premiJkk), premiJkm:num(r.premiJkm), premiKes:num(r.premiKes), natura:num(r.natura),
      bonus:num(r.bonus), thr:num(r.thr), tantiem:num(r.tantiem),
      iuranZakat:num(r.iuranZakat), iuranPensiun:num(r.iuranPensiun), iuranJht:num(r.iuranJht),
      bruto:r.bruto, pengurang:r.pengurang||0, kategoriTer:r.kategoriTer,
      tarifTer:r.tarifTer||'', pphTerutang:r.pphTerutang
    };
    try{ await API.saveRecord(rec); toast('Perhitungan disimpan ke spreadsheet'); }
    catch(e){ toast(e.message, true); }
  }

  function resetCalc(){
    ['c_gajiPokok','c_tunjangan','c_uangMakan','c_uangLembur','c_penghasilanLain','c_tunjanganPph',
     'c_premiJkk','c_premiJkm','c_premiKes','c_natura','c_bonus','c_thr','c_tantiem',
     'c_iuranZakat','c_iuranPensiun','c_iuranJht','c_brutoSetahun','c_pengurangSetahun','c_pphDipotong']
      .forEach(i=>setVal(i,'0'));
    $('c_result').style.display='none'; $('c_save').style.display='none'; lastResult=null;
  }

  // ---------- REKAP BULANAN ----------
  async function loadRecords(){
    const box=$('recList'); box.innerHTML='<div class="empty">Memuat…</div>';
    try{
      const recs = await API.getRecords(val('r_bulan'), val('r_tahun')) || [];
      if(!recs.length){ box.innerHTML='<div class="empty">Tidak ada data untuk periode ini.</div>'; return; }
      let totBruto=0,totPph=0;
      let h='<table><thead><tr><th>Nama</th><th>PTKP</th><th>Kategori</th><th class="num">Bruto</th><th class="num">Tarif</th><th class="num">PPh 21</th><th></th></tr></thead><tbody>';
      recs.forEach(r=>{
        totBruto+=num(r.bruto); totPph+=num(r.pphTerutang);
        const tarif = r.tarifTer!=='' && r.tarifTer!=null ? (num(r.tarifTer)*100).toFixed(2).replace('.',',')+'%' : '-';
        h+=`<tr><td>${r.nama||''}</td><td>${r.statusPtkp||''}</td><td>${pillTer(r.kategoriTer)}</td>
          <td class="num">${rupiah(r.bruto)}</td><td class="num">${tarif}</td>
          <td class="num">${rupiah(r.pphTerutang)}</td>
          <td class="no-print"><button class="btn btn-danger btn-sm" onclick="App.hapusRecord('${r.id}')">Hapus</button></td></tr>`;
      });
      h+=`</tbody><tfoot><tr style="font-weight:700"><td colspan="3">TOTAL (${recs.length} karyawan)</td>
        <td class="num">${rupiah(totBruto)}</td><td></td><td class="num">${rupiah(totPph)}</td><td></td></tr></tfoot></table>`;
      box.innerHTML=h;
    }catch(e){ box.innerHTML='<div class="empty">'+e.message+'</div>'; }
  }

  async function hapusRecord(id){
    if(!confirm('Hapus baris perhitungan ini?')) return;
    try{ await API.deleteRecord(id); toast('Dihapus'); await loadRecords(); }
    catch(e){ toast(e.message, true); }
  }

  // ---------- SUMMARY ----------
  async function loadSummary(){
    const box=$('sumList'); box.innerHTML='<div class="empty">Memuat…</div>';
    try{
      const sum = await API.getSummary(val('s_tahun'),'') || [];
      if(!sum.length){ box.innerHTML='<div class="empty">Belum ada data tahun ini.</div>'; return; }
      let h='<table><thead><tr><th>Nama</th><th>PTKP</th>';
      MONTHS.forEach(m=>h+=`<th class="num">${m.slice(0,3)}</th>`);
      h+='<th class="num">Total PPh</th></tr></thead><tbody>';
      let grand=0;
      sum.forEach(s=>{
        h+=`<tr><td>${s.nama||''}</td><td>${s.statusPtkp||''}</td>`;
        MONTHS.forEach(m=>{
          const v = s.bulan && s.bulan[m] ? s.bulan[m].pph : 0;
          h+=`<td class="num">${v? (v/1000).toLocaleString('id-ID')+'k' : '-'}</td>`;
        });
        grand+=num(s.totalPph);
        h+=`<td class="num"><b>${rupiah(s.totalPph)}</b></td></tr>`;
      });
      h+=`</tbody><tfoot><tr style="font-weight:700"><td colspan="${2+MONTHS.length}">TOTAL SETAHUN</td><td class="num">${rupiah(grand)}</td></tr></tfoot></table>`;
      box.innerHTML=h;
    }catch(e){ box.innerHTML='<div class="empty">'+e.message+'</div>'; }
  }

  // ---------- BUKTI POTONG ----------
  async function loadBuktiPotong(){
    const area=$('bpArea'); area.innerHTML='<div class="empty">Memuat…</div>';
    try{
      const recs = await API.getRecords(val('bp_bulan'), val('bp_tahun')) || [];
      const empId = val('bp_emp');
      const r = recs.find(x=>String(x.employeeId)===String(empId));
      if(!r){ area.innerHTML='<div class="empty">Belum ada perhitungan tersimpan untuk karyawan & periode ini.</div>'; return; }
      const emp = employees.find(e=>String(e.id)===String(empId)) || {};
      const tarif = r.tarifTer!=='' && r.tarifTer!=null ? (num(r.tarifTer)*100).toFixed(2).replace('.',',')+'%' : '-';
      area.innerHTML = `
      <div class="card">
        <div style="text-align:center;border-bottom:2px solid var(--ink);padding-bottom:10px;margin-bottom:14px">
          <h2 style="margin:0">BUKTI PEMOTONGAN PPh PASAL 21</h2>
          <div class="muted">Masa Pajak: ${r.bulan} ${r.tahun} &nbsp;·&nbsp; Metode: ${r.kategoriTer}</div>
        </div>
        <table>
          <tr><td style="width:40%">Nama Penerima Penghasilan</td><td><b>${r.nama||''}</b></td></tr>
          <tr><td>NIK / NPWP</td><td>${emp.nik||'-'} / ${emp.punyaNpwp==='TIDAK'?'(Tanpa NPWP)':(emp.npwp||'-')}</td></tr>
          <tr><td>Status PTKP</td><td>${r.statusPtkp||''}</td></tr>
          <tr><td>Penghasilan Bruto</td><td class="num">${rupiah(r.bruto)}</td></tr>
          <tr><td>Tarif Efektif (TER)</td><td class="num">${tarif}</td></tr>
          <tr style="font-weight:700;font-size:15px"><td>PPh Pasal 21 Dipotong</td><td class="num">${rupiah(r.pphTerutang)}</td></tr>
        </table>
        <div style="margin-top:30px;display:flex;justify-content:flex-end">
          <div style="text-align:center">
            <div class="muted">Pemotong Pajak,</div>
            <div style="height:60px"></div>
            <div style="border-top:1px solid var(--ink);padding-top:4px;min-width:180px">(_______________)</div>
          </div>
        </div>
      </div>`;
    }catch(e){ area.innerHTML='<div class="empty">'+e.message+'</div>'; }
  }

  return { init, loadEmployees, editKaryawan, simpanKaryawan, hapusKaryawan, resetEmp,
    hitung, resetCalc, simpanRecord, loadRecords, hapusRecord, loadSummary, loadBuktiPotong };
})();

document.addEventListener('DOMContentLoaded', App.init);
