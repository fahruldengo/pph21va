/* ============================================================
   SISTEM PPh PASAL 21 — FRONTEND LOGIC
   API GET-only (CORS-safe) ke Apps Script, atau mode demo localStorage.
   ============================================================ */

// ---------- Referensi (mirror dari backend, untuk hitung di klien) ----------
const PTKP = {
  'TK/0':{setahun:54000000,sebulan:4500000},'TK/1':{setahun:58500000,sebulan:4875000},
  'TK/2':{setahun:63000000,sebulan:5250000},'TK/3':{setahun:67500000,sebulan:5625000},
  'K/0':{setahun:58500000,sebulan:4875000},'K/1':{setahun:63000000,sebulan:5250000},
  'K/2':{setahun:67500000,sebulan:5625000},'K/3':{setahun:72000000,sebulan:6000000},
  'K/I/0':{setahun:112500000,sebulan:9375000},'K/I/1':{setahun:117000000,sebulan:9750000},
  'K/I/2':{setahun:121500000,sebulan:10125000},'K/I/3':{setahun:126000000,sebulan:10500000}
};
const PTKP_TO_TER = {
  'TK/0':'A','TK/1':'A','K/0':'A','TK/2':'B','TK/3':'B','K/1':'B','K/2':'B',
  'K/3':'C','K/I/0':'C','K/I/1':'C','K/I/2':'C','K/I/3':'C'
};
const ELEMEN = { jht:0.037, jkk:0.0024, jkm:0.003, jp:0.02, kes:0.04, maxJP:10042300, maxKes:12000000 };
const MONTHS = ['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGT','SEP','OKT','NOV','DES'];
const MONTH_LABEL = {JAN:'Januari',FEB:'Februari',MAR:'Maret',APR:'April',MEI:'Mei',JUN:'Juni',JUL:'Juli',AGT:'Agustus',SEP:'September',OKT:'Oktober',NOV:'November',DES:'Desember'};

const TER = {
"A":[[0,5400000,0],[5400000,5650000,0.0025],[5650000,5950000,0.005],[5950000,6300000,0.0075],[6300000,6750000,0.01],[6750000,7500000,0.0125],[7500000,8550000,0.015],[8550000,9650000,0.0175],[9650000,10050000,0.02],[10050000,10350000,0.0225],[10350000,10700000,0.025],[10700000,11050000,0.03],[11050000,11600000,0.035],[11600000,12500000,0.04],[12500000,13750000,0.05],[13750000,15100000,0.06],[15100000,16950000,0.07],[16950000,19750000,0.08],[19750000,24150000,0.09],[24150000,26450000,0.1],[26450000,28000000,0.11],[28000000,30050000,0.12],[30050000,32400000,0.13],[32400000,35400000,0.14],[35400000,39100000,0.15],[39100000,43850000,0.16],[43850000,47800000,0.17],[47800000,51400000,0.18],[51400000,56300000,0.19],[56300000,62200000,0.2],[62200000,68600000,0.21],[68600000,77500000,0.22],[77500000,89000000,0.23],[89000000,103000000,0.24],[103000000,125000000,0.25],[125000000,157000000,0.26],[157000000,206000000,0.27],[206000000,337000000,0.28],[337000000,454000000,0.29],[454000000,550000000,0.3],[550000000,695000000,0.31],[695000000,910000000,0.32],[910000000,1400000000,0.33],[1400000000,1e14,0.34]],
"B":[[0,6200000,0],[6200000,6500000,0.0025],[6500000,6850000,0.005],[6850000,7300000,0.0075],[7300000,9200000,0.01],[9200000,10750000,0.015],[10750000,11250000,0.02],[11250000,11600000,0.025],[11600000,12600000,0.03],[12600000,13600000,0.04],[13600000,14950000,0.05],[14950000,16400000,0.06],[16400000,18450000,0.07],[18450000,21850000,0.08],[21850000,26000000,0.09],[26000000,27700000,0.1],[27700000,29350000,0.11],[29350000,31450000,0.12],[31450000,33950000,0.13],[33950000,37100000,0.14],[37100000,41100000,0.15],[41100000,45800000,0.16],[45800000,49500000,0.17],[49500000,53800000,0.18],[53800000,58500000,0.19],[58500000,64000000,0.2],[64000000,71000000,0.21],[71000000,80000000,0.22],[80000000,93000000,0.23],[93000000,109000000,0.24],[109000000,129000000,0.25],[129000000,163000000,0.26],[163000000,211000000,0.27],[211000000,374000000,0.28],[374000000,459000000,0.29],[459000000,555000000,0.3],[555000000,704000000,0.31],[704000000,957000000,0.32],[957000000,1405000000,0.33],[1405000000,1e14,0.34]],
"C":[[0,6600000,0],[6600000,6950000,0.0025],[6950000,7350000,0.005],[7350000,7800000,0.0075],[7800000,8850000,0.01],[8850000,9800000,0.0125],[9800000,10950000,0.015],[10950000,11200000,0.0175],[11200000,12050000,0.02],[12050000,12950000,0.03],[12950000,14150000,0.04],[14150000,15550000,0.05],[15550000,17050000,0.06],[17050000,19500000,0.07],[19500000,22700000,0.08],[22700000,26600000,0.09],[26600000,28100000,0.1],[28100000,30100000,0.11],[30100000,32600000,0.12],[32600000,35400000,0.13],[35400000,38900000,0.14],[38900000,43000000,0.15],[43000000,47400000,0.16],[47400000,51200000,0.17],[51200000,55800000,0.18],[55800000,60400000,0.19],[60400000,66700000,0.2],[66700000,74500000,0.21],[74500000,83200000,0.22],[83200000,95600000,0.23],[95600000,110000000,0.24],[110000000,134000000,0.25],[134000000,169000000,0.26],[169000000,221000000,0.27],[221000000,390000000,0.28],[390000000,463000000,0.29],[463000000,561000000,0.3],[561000000,709000000,0.31],[709000000,965000000,0.32],[965000000,1419000000,0.33],[1419000000,1e14,0.34]]
};

function terRate(kat, bruto){
  const arr = TER[kat] || TER.A;
  for (const [lo,hi,r] of arr) if (bruto>=lo && bruto<hi) return r;
  return arr[arr.length-1][2];
}
function pasal17(pkp){
  const br=[[60000000,.05],[250000000,.15],[500000000,.25],[5000000000,.30],[Infinity,.35]];
  let tax=0, prev=0;
  for (const [cap,rate] of br){
    if (pkp>cap){ tax+=(cap-prev)*rate; prev=cap; }
    else { tax+=(pkp-prev)*rate; break; }
  }
  return Math.round(tax);
}

// ---------- Util ----------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const N = v => { const n=Number(v); return isNaN(n)?0:n; };
const fmt = n => Math.round(N(n)).toLocaleString('id-ID');
const pct = r => (N(r)*100).toLocaleString('id-ID',{maximumFractionDigits:2})+'%';
function toast(msg, err){ const t=$('#toast'); t.textContent=msg; t.className='toast show'+(err?' err':''); setTimeout(()=>t.className='toast',2600); }

// ---------- Terbilang ----------
function terbilang(n){
  n=Math.floor(Math.abs(n));
  const sat=['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
  function f(x){
    if(x<12) return sat[x];
    if(x<20) return f(x-10)+' belas';
    if(x<100) return f(Math.floor(x/10))+' puluh'+(x%10?' '+f(x%10):'');
    if(x<200) return 'seratus'+(x%100?' '+f(x%100):'');
    if(x<1000) return f(Math.floor(x/100))+' ratus'+(x%100?' '+f(x%100):'');
    if(x<2000) return 'seribu'+(x%1000?' '+f(x%1000):'');
    if(x<1000000) return f(Math.floor(x/1000))+' ribu'+(x%1000?' '+f(x%1000):'');
    if(x<1000000000) return f(Math.floor(x/1000000))+' juta'+(x%1000000?' '+f(x%1000000):'');
    return f(Math.floor(x/1000000000))+' miliar'+(x%1000000000?' '+f(x%1000000000):'');
  }
  if(n===0) return 'Nol rupiah';
  let r=f(n).replace(/\s+/g,' ').trim();
  return r.charAt(0).toUpperCase()+r.slice(1)+' rupiah';
}

/* ============================================================
   API LAYER — GET-only ke Apps Script, fallback localStorage (demo)
   ============================================================ */
const API = {
  url: '',
  demo: false,
  async call(action, payload){
    if (this.demo) return Demo.handle(action, payload);
    const u = new URL(this.url);
    u.searchParams.set('action', action);
    if (payload) u.searchParams.set('payload', JSON.stringify(payload));
    const res = await fetch(u.toString(), { method:'GET' });
    const data = await res.json();
    if (data && data.error) throw new Error(data.error);
    return data;
  }
};

// Demo backend (mirror logic of Code.gs, in-browser)
const Demo = {
  key:'pph21_demo',
  db(){ try{return JSON.parse(localStorage.getItem(this.key))||{}}catch(e){return{}} },
  save(d){ localStorage.setItem(this.key, JSON.stringify(d)); },
  seed(){
    const d=this.db();
    if(!d.perusahaan) d.perusahaan={nama_perusahaan:'CV. VIDYA AMALIAH',npwp_perusahaan:'0934538901822000',nama_pemotong:'YASIN YUSUF',npwp_pemotong:'077250454822000'};
    if(!d.pegawai) d.pegawai=[
      {id:'EMP-1',nama:'FARIN POHANTALO',jenis_kelamin:'Laki-laki',jabatan:'GM Regional Cluster',nik:'7501041111790003',ptkp:'K/3',punya_npwp:'YA',npwp:'7501041111790003',kode_objek_pajak:'21-100-01',alamat:'Gorontalo',metode_gross_up:'No',aktif:'Ya'},
      {id:'EMP-2',nama:'DEWI ANGGRAINI',jenis_kelamin:'Perempuan',jabatan:'Staff Keuangan',nik:'7501042222880004',ptkp:'TK/0',punya_npwp:'YA',npwp:'7501042222880004',kode_objek_pajak:'21-100-01',alamat:'Gorontalo',metode_gross_up:'No',aktif:'Ya'}
    ];
    if(!d.pajak) d.pajak=[];
    this.save(d);
  },
  handle(action, p){
    this.seed();
    const d=this.db();
    switch(action){
      case 'ping': return {ok:true};
      case 'bootstrap': return {ok:true};
      case 'getRefs': return {ptkp:PTKP,ter:TER,ptkpToTer:PTKP_TO_TER,elemen:ELEMEN,months:MONTHS};
      case 'getPerusahaan': return d.perusahaan;
      case 'savePerusahaan': d.perusahaan=Object.assign(d.perusahaan,p); this.save(d); return d.perusahaan;
      case 'listPegawai': return d.pegawai;
      case 'savePegawai': {
        if(!p.id) p.id='EMP-'+Date.now();
        const i=d.pegawai.findIndex(x=>x.id===p.id);
        if(i>=0) d.pegawai[i]=Object.assign(d.pegawai[i],p); else d.pegawai.push(p);
        this.save(d); return {ok:true,id:p.id};
      }
      case 'deletePegawai': d.pegawai=d.pegawai.filter(x=>x.id!==p.id); this.save(d); return {ok:true};
      case 'listPajak': return d.pajak.filter(r=>(!p.tahun||String(r.tahun)===String(p.tahun))&&(!p.bulan||r.bulan===p.bulan));
      case 'savePajak': {
        const c=Calc.compute(p);
        if(c.grossUp) p.tunjangan_pph=c.tunjPph;
        Object.assign(p,{bruto:c.bruto,kategori_ter:c.kat,tarif_ter:c.tarif,pph_terutang:c.pph});
        if(!p.id) p.id='TX-'+Date.now();
        const i=d.pajak.findIndex(x=>x.id===p.id);
        if(i>=0) d.pajak[i]=p; else d.pajak.push(p);
        this.save(d); return {ok:true,id:p.id,calc:c};
      }
      case 'deletePajak': d.pajak=d.pajak.filter(x=>x.id!==p.id); this.save(d); return {ok:true};
      case 'summary': return this.summary(p.tahun);
    }
  },
  summary(tahun){
    const d=this.db();
    const rows=d.pajak.filter(r=>String(r.tahun)===String(tahun));
    const emp={}; d.pegawai.forEach(e=>emp[e.id]=e);
    const byEmp={};
    rows.forEach(r=>{
      const k=r.pegawai_id; if(!byEmp[k]) byEmp[k]={bulan:{},bruto:0,pph:0,iuran:0,zakat:0};
      byEmp[k].bulan[r.bulan]=r; byEmp[k].bruto+=N(r.bruto); byEmp[k].pph+=N(r.pph_terutang);
      byEmp[k].iuran+=N(r.iuran_jht)+N(r.iuran_jp); byEmp[k].zakat+=N(r.zakat);
    });
    const employees=Object.keys(byEmp).map(k=>{
      const e=byEmp[k]; const m=emp[k]||{nama:'(?)',ptkp:'TK/0'};
      const bln=Object.keys(e.bulan).length;
      const bj=Math.min(e.bruto*0.05,6000000);
      const neto=e.bruto-bj-e.iuran-e.zakat;
      const ptkp=PTKP[m.ptkp]?PTKP[m.ptkp].setahun:54000000;
      const pkp=Math.max(0,Math.floor((neto-ptkp)/1000)*1000);
      const setahun=pasal17(pkp);
      return {pegawai_id:k,nama:m.nama,ptkp:m.ptkp,total_bruto:e.bruto,total_pph_dipotong:e.pph,
        pph_setahun:setahun,neto:Math.round(neto),pkp,kurang_lebih:setahun-e.pph,
        bulan:bln, berhenti:String(m.aktif||'').toLowerCase()==='berhenti', bulan_berhenti:m.bulan_berhenti||''};
    });
    const grand=employees.reduce((a,r)=>({bruto:a.bruto+r.total_bruto,pph:a.pph+r.total_pph_dipotong,setahun:a.setahun+r.pph_setahun}),{bruto:0,pph:0,setahun:0});
    return {tahun,employees,grand};
  }
};

/* ============================================================
   APP CONTROLLER
   ============================================================ */
const App = {
  pegawai:[], perusahaan:{},
  async init(){
    // populate selects
    fillMonths(); fillPtkp(); fillYears();
    bindNav(); bindRefTabs();
    $$('.ci, #c_ptkp, #c_gaji').forEach(()=>{});
    $$('#view-kalkulator input, #view-kalkulator select').forEach(el=>el.addEventListener('input',()=>Calc.run()));
    $('#dashYear').addEventListener('change',Dashboard.render);
    $('#dashMonth').addEventListener('change',Dashboard.render);

    const saved = localStorage.getItem('pph21_api');
    if (CONFIG.API_URL){ API.url=CONFIG.API_URL; await this.boot(); }
    else if (saved==='__demo__'){ this.useDemo(true); }
    else if (saved){ API.url=saved; await this.boot(); }
    else { setConn(false); this.go('setup'); $('#nav').style.visibility='hidden'; }
  },
  async connect(){
    const u=$('#apiInput').value.trim();
    if(!u){ toast('URL belum diisi',true); return; }
    API.url=u; API.demo=false;
    try{ await API.call('ping'); localStorage.setItem('pph21_api',u); await this.boot(); toast('Tersambung ke spreadsheet'); }
    catch(e){ setConn(false,true); toast('Gagal menyambung: '+e.message,true); }
  },
  useDemo(silent){
    API.demo=true; localStorage.setItem('pph21_api','__demo__');
    Demo.seed(); this.boot(); if(!silent) toast('Mode demo aktif (data di browser)');
  },
  disconnect(){ localStorage.removeItem('pph21_api'); location.reload(); },
  async boot(){
    $('#nav').style.visibility='visible';
    setConn(true);
    try{
      await API.call('bootstrap');
      this.pegawai = await API.call('listPegawai');
      this.perusahaan = await API.call('getPerusahaan');
      $('#connTxt').textContent = API.demo ? 'mode demo' : 'tersambung';
      Calc.fillEmpSelect(); Settings.load();
      this.go('dashboard');
      Dashboard.render();
      Calc.run();
    }catch(e){ setConn(false,true); toast('Error: '+e.message,true); }
  },
  go(view){
    $$('.view').forEach(v=>v.classList.remove('active'));
    $('#view-'+view).classList.add('active');
    $$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    if(view==='pegawai') Emp.load();
    if(view==='pajak') Tax.render();
    if(view==='tahunan') Annual.render();
    if(view==='referensi') Ref.render('ptkp');
    if(view==='dashboard') Dashboard.render();
    window.scrollTo({top:0,behavior:'smooth'});
  }
};
function setConn(on,err){ const d=$('#connDot'); d.className='dot'+(err?' err':on?' on':''); $('#connTxt').textContent=err?'gagal':on?'tersambung':'belum tersambung'; }
function bindNav(){ $('#nav').addEventListener('click',e=>{ if(e.target.dataset.view) App.go(e.target.dataset.view); }); }
function bindRefTabs(){ $('#refTabs').addEventListener('click',e=>{ if(e.target.dataset.ref){ $$('#refTabs button').forEach(b=>b.classList.remove('active')); e.target.classList.add('active'); Ref.render(e.target.dataset.ref);} }); }
function fillMonths(){
  const opts=MONTHS.map(m=>`<option value="${m}">${MONTH_LABEL[m]}</option>`).join('');
  ['#c_bulan','#dashMonth','#pjMonth'].forEach(s=>$(s).innerHTML=(s!=='#c_bulan'?'<option value="">Semua masa</option>':'')+opts);
}
function fillPtkp(){
  const opts=Object.keys(PTKP).map(k=>`<option>${k}</option>`).join('');
  ['#c_ptkp','#e_ptkp'].forEach(s=>$(s).innerHTML=opts);
  $('#c_ptkp').value='TK/0';
}
function fillYears(){
  const y=CONFIG.DEFAULT_YEAR||2026; const opts=[y-1,y,y+1].map(v=>`<option ${v===y?'selected':''}>${v}</option>`).join('');
  ['#dashYear','#pjYear','#anYear'].forEach(s=>$(s).innerHTML=opts);
}

/* ============================================================
   KALKULATOR
   ============================================================ */
const Calc = {
  fillEmpSelect(){
    const active = App.pegawai.filter(e=>String(e.aktif||'Aktif').toLowerCase()!=='berhenti');
    $('#c_pegawai').innerHTML='<option value="">— input manual —</option>'+
      active.map(e=>`<option value="${e.id}">${esc(e.nama)}</option>`).join('');
  },
  loadEmp(){
    const id=$('#c_pegawai').value; const e=App.pegawai.find(x=>x.id===id);
    if(e){
      $('#c_ptkp').value=e.ptkp||'TK/0';
      $('#c_grossup').value=(String(e.metode_gross_up).toLowerCase()==='yes')?'Yes':'No';
    }
    this.run();
  },
  autoPremi(){
    const gaji=N($('#c_gaji').value);
    $('#c_jkk').value=Math.round(Math.min(gaji,ELEMEN.maxKes)*ELEMEN.jkk);
    $('#c_jkm').value=Math.round(Math.min(gaji,ELEMEN.maxKes)*ELEMEN.jkm);
    $('#c_kes').value=Math.round(Math.min(gaji,ELEMEN.maxKes)*ELEMEN.kes);
    this.run();
  },
  read(){
    return {
      ptkp:$('#c_ptkp').value, bulan:$('#c_bulan').value, tahun:$('#c_tahun').value,
      pegawai_id:$('#c_pegawai').value, metode_gross_up:$('#c_grossup').value,
      gaji:N($('#c_gaji').value), tunjangan_pph:N($('#c_tunjpph').value),
      tunjangan_lainnya:N($('#c_tunjlain').value), honorarium:N($('#c_honor').value),
      bonus_thr:N($('#c_bonus').value), natura:N($('#c_natura').value),
      premi_jkk:N($('#c_jkk').value), premi_jkm:N($('#c_jkm').value), premi_kes:N($('#c_kes').value),
      iuran_jht:N($('#c_jht').value), iuran_jp:N($('#c_jp').value), zakat:N($('#c_zakat').value)
    };
  },
  compute(p){
    const kat = PTKP_TO_TER[p.ptkp]||'A';
    const grossUp = String(p.metode_gross_up).toLowerCase()==='yes';
    const base = N(p.gaji)+N(p.tunjangan_lainnya)+N(p.honorarium)
               + N(p.bonus_thr)+N(p.natura)+N(p.premi_jkk)+N(p.premi_jkm)+N(p.premi_kes);
    let tunjPph = grossUp ? 0 : N(p.tunjangan_pph);
    let bruto, tarif, pph;
    if (grossUp){
      for (let i=0;i<60;i++){
        bruto = base+tunjPph; tarif = terRate(kat,bruto); pph = Math.round(bruto*tarif);
        if (Math.abs(pph-tunjPph)<1) break;
        tunjPph = pph;
      }
      bruto = base+tunjPph; tarif = terRate(kat,bruto); pph = Math.round(bruto*tarif);
    } else {
      bruto = base+tunjPph; tarif = terRate(kat,bruto); pph = Math.round(bruto*tarif);
    }
    return { bruto:Math.round(bruto), kat, tarif, pph, tunjPph:Math.round(tunjPph), grossUp };
  },
  run(){
    const p=this.read(); const c=this.compute(p);
    // Gross up: tunjangan PPh = PPh terutang; isi otomatis & kunci field-nya
    const tunjField=$('#c_tunjpph'), hint=$('#c_tunjpph_hint');
    if (c.grossUp){
      tunjField.value=c.tunjPph; tunjField.readOnly=true;
      tunjField.style.background='var(--accent-soft)'; tunjField.style.color='var(--accent)';
      hint.style.display='inline';
    } else {
      tunjField.readOnly=false; tunjField.style.background=''; tunjField.style.color='';
      hint.style.display='none';
    }
    $('#r_bruto').textContent=fmt(c.bruto);
    $('#r_kat').textContent='TER '+c.kat; $('#r_kat').className='tag '+c.kat.toLowerCase();
    $('#r_tarif').textContent=pct(c.tarif);
    $('#r_pph').textContent=fmt(c.pph); $('#r_pph2').textContent=fmt(c.pph);
    $('#r_terbilang').textContent=terbilang(c.pph);
  },
  async saveToData(){
    const p=this.read();
    if(!p.pegawai_id){ toast('Pilih pegawai dulu untuk menyimpan ke data pajak',true); return; }
    p.jenis_penghasilan = p.bonus_thr>0 ? 'Teratur + Tidak teratur' : 'Teratur';
    p.tanggal_potong = new Date().toLocaleDateString('id-ID');
    p.fasilitas='Tanpa Fasilitas';
    try{
      const dup = (await API.call('listPajak',{tahun:p.tahun,bulan:p.bulan})).find(r=>r.pegawai_id===p.pegawai_id);
      if(dup){ if(!confirm('Sudah ada data masa ini untuk pegawai tsb. Timpa?')) return; p.id=dup.id; }
      await API.call('savePajak',p);
      toast('Tersimpan ke Data Pajak'); App.go('pajak');
    }catch(e){ toast('Gagal simpan: '+e.message,true); }
  }
};

/* ============================================================
   PEGAWAI
   ============================================================ */
const Emp = {
  async load(){ App.pegawai = await API.call('listPegawai'); Calc.fillEmpSelect(); this.render(); },
  render(){
    const q=($('#empSearch').value||'').toLowerCase();
    const rows=App.pegawai.filter(e=>!q||[e.nama,e.nik,e.jabatan].join(' ').toLowerCase().includes(q));
    const body=$('#empBody');
    if(!rows.length){ body.innerHTML=`<tr><td colspan="7"><div class="empty"><h3>Belum ada pegawai</h3><p>Tambahkan pegawai untuk mulai menghitung PPh 21.</p></div></td></tr>`; return; }
    body.innerHTML=rows.map(e=>{
      const berhenti = String(e.aktif||'Aktif').toLowerCase()==='berhenti';
      const statusCell = berhenti
        ? `<span class="tag muted">Berhenti${e.bulan_berhenti?' · '+MONTH_LABEL[e.bulan_berhenti]:''}</span>`
        : '<span class="tag a">Aktif</span>';
      return `<tr style="${berhenti?'opacity:.62':''}">
      <td><b>${esc(e.nama)}</b><div style="font-size:12px;color:var(--ink-soft)">${esc(e.jenis_kelamin||'')}${String(e.metode_gross_up).toLowerCase()==='yes'?' · Gross Up':''}</div></td>
      <td>${esc(e.jabatan||'-')}</td>
      <td class="mono" style="font-size:12px">${esc(e.nik||'-')}</td>
      <td><span class="tag muted">${esc(e.ptkp||'-')}</span></td>
      <td class="mono" style="font-size:12px">${e.punya_npwp==='YA'?esc(e.npwp||'-'):'<span style="color:var(--warn)">Tanpa NPWP</span>'}</td>
      <td>${statusCell}</td>
      <td><div class="rowact">
        <button class="btn sm ghost" onclick="Emp.openModal('${e.id}')">Ubah</button>
        <button class="btn sm ghost danger" onclick="Emp.del('${e.id}','${esc(e.nama)}')">Hapus</button>
      </div></td></tr>`;
    }).join('');
  },
  openModal(id){
    // populate berhenti-month select once
    if(!$('#e_berhenti').options.length)
      $('#e_berhenti').innerHTML=MONTHS.map(m=>`<option value="${m}">${MONTH_LABEL[m]}</option>`).join('');
    const e = id ? App.pegawai.find(x=>x.id===id) : {};
    $('#empModalTitle').textContent = id?'Ubah pegawai':'Tambah pegawai';
    $('#e_id').value=e.id||''; $('#e_nama').value=e.nama||''; $('#e_jabatan').value=e.jabatan||'';
    $('#e_jk').value=e.jenis_kelamin||'Laki-laki'; $('#e_ptkp').value=e.ptkp||'TK/0';
    $('#e_nik').value=e.nik||''; $('#e_idtku').value=e.id_tku||'';
    $('#e_punyanpwp').value=e.punya_npwp||'YA'; $('#e_npwp').value=e.npwp||'';
    $('#e_kop').value=e.kode_objek_pajak||'21-100-01'; $('#e_gu').value=e.metode_gross_up||'No';
    $('#e_aktif').value=(String(e.aktif||'Aktif').toLowerCase()==='berhenti')?'Berhenti':'Aktif';
    $('#e_berhenti').value=e.bulan_berhenti||'DES';
    $('#e_alamat').value=e.alamat||'';
    this.toggleBerhenti();
    $('#empModal').classList.add('open');
  },
  toggleBerhenti(){
    $('#e_berhenti_wrap').style.display = $('#e_aktif').value==='Berhenti' ? 'flex' : 'none';
  },
  closeModal(){ $('#empModal').classList.remove('open'); },
  async save(){
    const berhenti = $('#e_aktif').value==='Berhenti';
    const p={
      id:$('#e_id').value||undefined, nama:$('#e_nama').value.trim(), jabatan:$('#e_jabatan').value.trim(),
      jenis_kelamin:$('#e_jk').value, ptkp:$('#e_ptkp').value, nik:$('#e_nik').value.trim(),
      id_tku:$('#e_idtku').value.trim(), punya_npwp:$('#e_punyanpwp').value, npwp:$('#e_npwp').value.trim(),
      kode_objek_pajak:$('#e_kop').value.trim(), metode_gross_up:$('#e_gu').value, alamat:$('#e_alamat').value.trim(),
      aktif: berhenti?'Berhenti':'Aktif', bulan_berhenti: berhenti?$('#e_berhenti').value:''
    };
    if(!p.nama){ toast('Nama wajib diisi',true); return; }
    try{ await API.call('savePegawai',p); this.closeModal(); await this.load(); toast('Pegawai tersimpan'); }
    catch(e){ toast('Gagal: '+e.message,true); }
  },
  async del(id,nama){
    if(!confirm('Hapus pegawai "'+nama+'"?')) return;
    try{ await API.call('deletePegawai',{id}); await this.load(); toast('Pegawai dihapus'); }
    catch(e){ toast('Gagal: '+e.message,true); }
  }
};

/* ============================================================
   DATA PAJAK
   ============================================================ */
const Tax = {
  rows:[],
  async render(){
    const tahun=$('#pjYear').value, bulan=$('#pjMonth').value;
    try{ this.rows = await API.call('listPajak',{tahun,bulan}); }catch(e){ toast('Gagal memuat: '+e.message,true); return; }
    const emp={}; App.pegawai.forEach(e=>emp[e.id]=e);
    const body=$('#taxBody');
    if(!this.rows.length){ body.innerHTML=`<tr><td colspan="7"><div class="empty"><h3>Belum ada perhitungan</h3><p>Gunakan Kalkulator lalu simpan untuk mengisi data masa ini.</p></div></td></tr>`; return; }
    body.innerHTML=this.rows.map(r=>{
      const e=emp[r.pegawai_id]||{nama:'(?)'}; const kat=(r.kategori_ter||'').replace('TER ','').toLowerCase();
      return `<tr>
        <td><b>${esc(e.nama)}</b><div style="font-size:12px;color:var(--ink-soft)">${MONTH_LABEL[r.bulan]||r.bulan} ${r.tahun}</div></td>
        <td><span class="tag muted">${esc(r.ptkp||e.ptkp||'-')}</span></td>
        <td class="num">${fmt(r.bruto)}</td>
        <td><span class="tag ${kat}">${esc(r.kategori_ter||'-')}</span></td>
        <td class="num">${pct(r.tarif_ter)}</td>
        <td class="num"><b>${fmt(r.pph_terutang)}</b></td>
        <td><div class="rowact"><button class="btn sm ghost danger" onclick="Tax.del('${r.id}')">Hapus</button></div></td>
      </tr>`;
    }).join('');
  },
  async del(id){ if(!confirm('Hapus baris perhitungan ini?'))return; await API.call('deletePajak',{id}); this.render(); toast('Dihapus'); },
  exportCsv(){
    if(!this.rows.length){ toast('Tidak ada data',true); return; }
    const emp={}; App.pegawai.forEach(e=>emp[e.id]=e);
    const head=['Nama','PTKP','Bulan','Tahun','Bruto','Kategori TER','Tarif','PPh 21'];
    const lines=[head.join(',')].concat(this.rows.map(r=>{
      const e=emp[r.pegawai_id]||{nama:''};
      return [e.nama,r.ptkp,r.bulan,r.tahun,r.bruto,r.kategori_ter,r.tarif_ter,r.pph_terutang].join(',');
    }));
    const blob=new Blob([lines.join('\n')],{type:'text/csv'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`pph21_${$('#pjYear').value}_${$('#pjMonth').value||'semua'}.csv`; a.click();
  }
};

/* ============================================================
   TAHUNAN
   ============================================================ */
const Annual = {
  async render(){
    let s; try{ s=await API.call('summary',{tahun:$('#anYear').value}); }catch(e){ toast('Gagal: '+e.message,true); return; }
    $('#anStats').innerHTML=[
      stat('Total bruto setahun', fmt(s.grand.bruto), true),
      stat('PPh telah dipotong', fmt(s.grand.pph), true),
      stat('PPh terutang (Pasal 17)', fmt(s.grand.setahun), true),
      statHL('Selisih', (s.grand.setahun-s.grand.pph>=0?'':'(')+fmt(Math.abs(s.grand.setahun-s.grand.pph))+(s.grand.setahun-s.grand.pph>=0?'':')'), s.grand.setahun-s.grand.pph>=0?'Kurang potong':'Lebih potong')
    ].join('');
    const body=$('#anBody');
    if(!s.employees.length){ body.innerHTML=`<tr><td colspan="7"><div class="empty"><h3>Belum ada data tahun ini</h3></div></td></tr>`; return; }
    body.innerHTML=s.employees.map(r=>{
      const sel=r.kurang_lebih; const cls=sel>0?'var(--warn)':sel<0?'var(--accent)':'var(--ink-soft)';
      const partial = r.bulan<12;
      const sub = r.berhenti
        ? `Berhenti${r.bulan_berhenti?' · '+MONTH_LABEL[r.bulan_berhenti]:''} · ${r.bulan} bln`
        : partial ? `${r.bulan} bln (belum genap)` : '12 bln';
      return `<tr style="${r.berhenti?'opacity:.72':''}">
        <td><b>${esc(r.nama)}</b><div style="font-size:12px;color:var(--ink-soft)">${sub}</div></td>
        <td><span class="tag muted">${esc(r.ptkp)}</span></td>
        <td class="num">${fmt(r.total_bruto)}</td>
        <td class="num">${fmt(r.pkp)}</td>
        <td class="num">${fmt(r.pph_setahun)}</td>
        <td class="num">${fmt(r.total_pph_dipotong)}</td>
        <td class="num" style="color:${cls};font-weight:600">${sel<0?'(':''}${fmt(Math.abs(sel))}${sel<0?')':''}</td>
      </tr>`;
    }).join('');
  }
};

/* ============================================================
   DASHBOARD
   ============================================================ */
let charts={};
const Dashboard = {
  async render(){
    const tahun=$('#dashYear').value, bulan=$('#dashMonth').value;
    let rows; try{ rows=await API.call('listPajak',{tahun,bulan}); }catch(e){ return; }
    const all = bulan ? await API.call('listPajak',{tahun}) : rows;
    const totPph=rows.reduce((a,r)=>a+N(r.pph_terutang),0);
    const totBruto=rows.reduce((a,r)=>a+N(r.bruto),0);
    const nEmp=new Set(rows.map(r=>r.pegawai_id)).size;
    const avg=nEmp?totPph/nEmp:0;
    $('#dashStats').innerHTML=[
      stat('Penghasilan bruto', fmt(totBruto), true, bulan?MONTH_LABEL[bulan]:'Setahun'),
      statHL('PPh 21 terutang', fmt(totPph), bulan?MONTH_LABEL[bulan]:'Akumulasi tahun'),
      stat('Jumlah pegawai', nEmp, false, 'Dipotong masa ini'),
      stat('Rata-rata / pegawai', fmt(avg), true)
    ].join('');
    this.chartMonthly(all,tahun);
    this.chartTer(rows);
  },
  chartMonthly(all,tahun){
    const by={}; MONTHS.forEach(m=>by[m]=0);
    all.forEach(r=>by[r.bulan]=(by[r.bulan]||0)+N(r.pph_terutang));
    const ctx=mkCanvas('chartMonthly');
    if(charts.m)charts.m.destroy();
    charts.m=new Chart(ctx,{type:'bar',data:{labels:MONTHS,datasets:[{data:MONTHS.map(m=>by[m]),backgroundColor:'#0b6e4f',borderRadius:5,maxBarThickness:34}]},
      options:baseOpts(v=>'Rp '+fmt(v))});
  },
  chartTer(rows){
    const c={A:0,B:0,C:0}; rows.forEach(r=>{const k=(r.kategori_ter||'').replace('TER ','');if(c[k]!=null)c[k]++;});
    const ctx=mkCanvas('chartTer');
    if(charts.t)charts.t.destroy();
    charts.t=new Chart(ctx,{type:'doughnut',data:{labels:['TER A','TER B','TER C'],datasets:[{data:[c.A,c.B,c.C],backgroundColor:['#0b6e4f','#9a6a1f','#5b3f8c'],borderWidth:0}]},
      options:{cutout:'62%',plugins:{legend:{position:'bottom',labels:{font:{family:'Inter'},padding:14,usePointStyle:true}}}}});
  }
};
function mkCanvas(id){ const w=$('#'+id); w.innerHTML='<canvas height="180"></canvas>'; return w.querySelector('canvas'); }
function baseOpts(fmtFn){return{responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmtFn(c.parsed.y)}}},scales:{y:{ticks:{callback:v=>'Rp '+(v/1e6)+'jt',font:{family:'Inter'}},grid:{color:'#eee'}},x:{grid:{display:false},ticks:{font:{family:'JetBrains Mono',size:10}}}}};}

/* ============================================================
   REFERENSI
   ============================================================ */
const Ref = {
  render(which){
    const c=$('#refContent');
    if(which==='ptkp'){
      c.innerHTML=`<div class="grid cards2">
        <div class="tablewrap"><table><thead><tr><th>Status PTKP</th><th class="num">Setahun</th><th class="num">Sebulan</th></tr></thead>
        <tbody>${Object.entries(PTKP).map(([k,v])=>`<tr><td><b>${k}</b></td><td class="num">${fmt(v.setahun)}</td><td class="num">${fmt(v.sebulan)}</td></tr>`).join('')}</tbody></table></div>
        <div class="tablewrap"><table><thead><tr><th>Status PTKP</th><th>Kategori TER</th></tr></thead>
        <tbody>${Object.entries(PTKP_TO_TER).map(([k,v])=>`<tr><td><b>${k}</b></td><td><span class="tag ${v.toLowerCase()}">TER ${v}</span></td></tr>`).join('')}</tbody></table></div>
      </div><div class="note">PTKP sesuai PMK; tarif progresif Pasal 17 UU HPP: 5% (≤60jt), 15% (≤250jt), 25% (≤500jt), 30% (≤5M), 35% (>5M).</div>`;
    } else if(which==='elemen'){
      c.innerHTML=`<div class="tablewrap"><table><thead><tr><th>Komponen</th><th class="num">Tarif</th><th>Keterangan</th></tr></thead><tbody>
        <tr><td>BPJS TK — JHT (pemberi kerja)</td><td class="num">3,70%</td><td>Bukan penambah bruto</td></tr>
        <tr><td>BPJS TK — JKK</td><td class="num">0,24%</td><td>Penambah bruto</td></tr>
        <tr><td>BPJS TK — JKM</td><td class="num">0,30%</td><td>Penambah bruto</td></tr>
        <tr><td>BPJS TK — JP</td><td class="num">2,00%</td><td>Maks gaji Rp10.042.300</td></tr>
        <tr><td>BPJS Kesehatan</td><td class="num">4,00%</td><td>Maks gaji Rp12.000.000</td></tr>
      </tbody></table></div>`;
    } else {
      const arr=TER[which];
      c.innerHTML=`<div class="tablewrap" style="max-height:560px;overflow:auto"><table><thead><tr><th>No</th><th class="num">Batas bawah</th><th class="num">Batas atas</th><th class="num">Tarif</th></tr></thead>
        <tbody>${arr.map((b,i)=>`<tr><td class="mono">${i+1}</td><td class="num">${fmt(b[0])}</td><td class="num">${b[1]>=1e14?'∞':fmt(b[1])}</td><td class="num">${pct(b[2])}</td></tr>`).join('')}</tbody></table></div>`;
    }
  }
};

/* ============================================================
   PENGATURAN
   ============================================================ */
const Settings = {
  load(){
    const p=App.perusahaan||{};
    $('#s_namaperush').value=p.nama_perusahaan||''; $('#s_npwpperush').value=p.npwp_perusahaan||'';
    $('#s_namapemotong').value=p.nama_pemotong||''; $('#s_npwppemotong').value=p.npwp_pemotong||'';
    $('#apiInfo').innerHTML = API.demo ? 'Mode demo aktif — data tersimpan di browser ini saja.' : 'Tersambung ke: <span class="kbd">'+(API.url||'-')+'</span>';
  },
  async save(){
    const p={nama_perusahaan:$('#s_namaperush').value,npwp_perusahaan:$('#s_npwpperush').value,
      nama_pemotong:$('#s_namapemotong').value,npwp_pemotong:$('#s_npwppemotong').value};
    try{ App.perusahaan=await API.call('savePerusahaan',p); toast('Pengaturan tersimpan'); }
    catch(e){ toast('Gagal: '+e.message,true); }
  }
};

// helpers
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function stat(lbl,val,rp,meta){ return `<div class="card stat"><div class="lbl">${lbl}</div><div class="val ${rp?'rp':''}">${val}</div>${meta?`<div class="meta">${meta}</div>`:''}</div>`; }
function statHL(lbl,val,meta){ return `<div class="card stat hl"><div class="lbl">${lbl}</div><div class="val rp">${val}</div>${meta?`<div class="meta">${meta}</div>`:''}</div>`; }

document.addEventListener('DOMContentLoaded',()=>App.init());
