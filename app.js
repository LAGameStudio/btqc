const LS='bqct_state_v1';
const ERAS=['3025-3039 Succession Wars','3049-3052 Clan Invasion','3050-3067 Late Invasion / Civil War (default)','3068-3085 Jihad','3086-3152 Early Republic / Dark Age','3152+ ilClan'];
const FALLBACK_MECHS=[
{n:'Atlas AS7-D',bv:1897,pv:48,cb:9634000,ico:'♜',wc:'Assault'}, {n:'Marauder MAD-3R',bv:1363,pv:36,cb:6325000,ico:'♞',wc:'Heavy'},
{n:'Timber Wolf (Mad Cat) Prime',bv:2737,pv:52,cb:24360000,ico:'🐺',wc:'Heavy'}, {n:'Summoner (Thor) Prime',bv:2295,pv:45,cb:22900000,ico:'🦅',wc:'Heavy'},
{n:'Locust LCT-1V',bv:432,pv:16,cb:1519000,ico:'⚡',wc:'Light'}, {n:'Jenner JR7-D',bv:875,pv:24,cb:4465000,ico:'🔥',wc:'Light'},
{n:'Hunchback HBK-4G',bv:1041,pv:28,cb:3587000,ico:'🔨',wc:'Medium'}, {n:'Warhammer WHM-6R',bv:1299,pv:35,cb:6023000,ico:'🔱',wc:'Heavy'},
{n:'Raven RVN-3L',bv:906,pv:22,cb:4840000,ico:'🐦',wc:'Light'}, {n:'Catapult CPLT-C1',bv:1399,pv:33,cb:6382000,ico:'🎯',wc:'Heavy'},
{n:'Awesome AWS-8Q',bv:1605,pv:40,cb:6644000,ico:'⚡',wc:'Assault'}];
let MECHS=[...FALLBACK_MECHS];
let MECH_SOURCE='built-in fallback (12 units)';
function icoFor(wc){return wc==='Light'?'⚡':wc==='Medium'?'🔨':wc==='Assault'?'♜':wc&&wc.includes('Colossal')?'🗿':'♞'}
// Full MekBay catalog (type=Mek, 4,295 units, BV+PV+cost) generated from https://github.com/MegaMek/mekbay via db.mekbay.com/units.json
fetch('mechs.json').then(r=>{if(!r.ok)throw 0;return r.json()}).then(j=>{
  if(Array.isArray(j)&&j.length>100){MECHS=j.map(u=>({...u,ico:icoFor(u.wc)}));MECH_SOURCE=`MekBay catalog (${MECHS.length.toLocaleString()} Mek units, db.mekbay.com 2026-09-25)`;renderBrigs();renderMechRef();toast(`Loaded ${MECHS.length.toLocaleString()} MekBay mechs`)}
}).catch(()=>{renderMechRef()});
const MISSIONS=[
{t:'Ambush / Raid',d:'Hit supply convoy on Hinterlands trade road. Fast strikers favored.',obj:['Destroy 50% convoy vehicles','Capture supply cache','Exfiltrate off south edge'],pay:850000,map:{size:'32x34',loc:'Hinterlands crossroads',ter:'Light woods / road',cond:'Dawn, light fog (+1 ranged >12 hex)'}},
{t:'Breakthrough',d:'Punch through Draconis Combine picket to relieve garrison.',obj:['Exit 50% force off far edge','Destroy pillbox','Protect APC with tech team'],pay:1200000,map:{size:'36x48',loc:'Draconis border fort',ter:'Hills / bunker',cond:'Clear, extreme heat (+1 heat/turn)'}},
{t:'Recon Sweep',d:'Campaign Ops recon: identify OpFor composition, minimal engagement.',obj:['Scan 3 sensor posts','Survive with recon unit intact','Uplink data 3 turns'],pay:600000,map:{size:'48x48',loc:'Mercenary DMZ',ter:'Heavy woods / river',cond:'Rain (PSR +1 on slopes)'}},
{t:'Base Defense',d:'Hold Long-Term Storage Facility against retaliatory raid.',obj:['Keep depot >50% CF','Destroy all attackers or survive 10 turns','Protect Dropship'],pay:1400000,map:{size:'32x32',loc:'Home base',ter:'Urban / depot',cond:'Night (searchlights, +2 night)'}},
{t:'Extraction',d:'Recover downed MechWarrior behind lines. VTOL support available as GM asset.',obj:['Reach pilot','Escort pilot to LZ','Hold LZ 2 turns'],pay:950000,map:{size:'40x40',loc:'Clan occupation zone',ter:'Tundra',cond:'Snow (2x MP in deep snow)'}},
{t:'Flanking Assault',d:'Classic meeting engagement, modified by OpFor roll.',obj:['Destroy/cripple 50% OpFor','Hold center hill','Prevent flank collapse'],pay:1100000,map:{size:'36x36',loc:'Open steppe',ter:'Plains / hill',cond:'High winds (missiles +1)'}},
{t:'Salvage Claim',d:'Mercenaries contract: secure battlefield salvage before rival crew.',obj:['Tag 3 salvage wrecks','Defend salvage team','Deny rival tags'],pay:700000,map:{size:'34x34',loc:'Old Star League cache',ter:'Ruins',cond:'Dust (+1 spotting)'}},
{t:'Escort Duty',d:'Guard civilian convoy across Hinterlands gap.',obj:['Keep 2+ trucks alive','Clear ambushers by turn 8','No unit immobilized in pass'],pay:1000000,map:{size:'30x60',loc:'Mountain pass',ter:'Canyon',cond:'Rockslides (GM event on 2d6=2)'}},
{t:'Decapitation Strike',d:'Draconis-themed: remove enemy command lance.',obj:['Destroy command Mech','Jam comms 2 turns','Withdraw 50% force'],pay:1500000,map:{size:'36x36',loc:'Command post',ter:'Urban / HQ',cond:'ECM coverage (no C3 in radius 6)'}},
{t:'Feint & Withdraw',d:'Delay superior Clan star while main body repositions.',obj:['Survive 8 turns','Inflict 1 kill','Exit 75% force'],pay:800000,map:{size:'40x36',loc:'River crossing',ter:'River / bridge',cond:'Mud (vehicles bog +1)'}}];
function uid(){return Math.random().toString(36).slice(2,9)}
function load(){try{return JSON.parse(localStorage.getItem(LS))||null}catch(e){return null}}
function save(){localStorage.setItem(LS,JSON.stringify(S));}
let S=load()||{era:ERAS[2],mode:'TW',dates:[],brigades:[],scenarios:[],selScenario:null,activePredrop:null};
// BV skill multiplier table (Classic, simplified from TM p.315)
function bvMult(g,p){const t={'0/0':2.1,'1/1':1.8,'2/2':1.5,'3/3':1.25,'3/4':1.15,'4/4':1.1,'4/5':1.0,'5/5':0.9,'5/6':0.8,'6/6':0.75};const k=g+'/'+p;if(t[k])return t[k];let m=1.0+(4-g)*0.2+(5-p)*0.1;return Math.max(0.5,Math.round(m*100)/100)}
function pvSkill(g,p){return Math.max(8,Math.round((g+p)*2.2))} // rough AS PV w/ skill
function adjBV(bv,g,p){return Math.round(bv*bvMult(g,p))}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2200)}
function upkeep(b){let mv=b.inventory.filter(m=>b.active.some(a=>a.mech===m.id&&a.on)).reduce((s,m)=>s+m.cb,0);let men=b.active.filter(a=>a.on).length*15000;return Math.round(mv*0.04/12+men+25000)}
function val(m){return S.mode==='TW'?m.bv+' BV':m.pv+' PV'}
// TABS
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.getElementById('tab-'+b.dataset.tab).classList.add('active')});
// ERA + MODE
const eraSel=document.getElementById('eraSelect');ERAS.forEach(e=>{const o=document.createElement('option');o.textContent=e;eraSel.appendChild(o)});eraSel.value=S.era;eraSel.onchange=()=>{S.era=eraSel.value;save();renderAll()};
function setMode(m){S.mode=m;save();document.getElementById('modeTW').classList.toggle('active',m==='TW');document.getElementById('modeAS').classList.toggle('active',m==='AS');renderAll()}
document.getElementById('modeTW').onclick=()=>setMode('TW');document.getElementById('modeAS').onclick=()=>setMode('AS');setMode(S.mode||'TW');
// SCHEDULE
document.getElementById('addDateBtn').onclick=()=>{const d=document.getElementById('newDate').value;if(!d)return toast('Pick a date');S.dates.push({id:uid(),date:d,note:document.getElementById('newDateNote').value,status:'open',locked:false});save();renderAll();toast('Game date added')};
function renderDates(){const el=document.getElementById('dateList');el.innerHTML='';const today=new Date().toISOString().slice(0,10);
S.dates.sort((a,b)=>a.date.localeCompare(b.date)).forEach(g=>{if(g.date<today&&!g.locked&&g.status==='open'){g.locked=true}
const d=document.createElement('div');d.className='date-row'+(g.locked?' locked':'');
d.innerHTML=`<b>${g.date}</b> <span class="pill ${g.locked?'lock':g.status==='cancelled'?'cancel':'open'}">${g.locked?'LOCKED':g.status.toUpperCase()}</span> <span>${g.note||''}</span><div class="row"></div>`;
const row=d.querySelector('.row');
const mk=(t,fn,dis)=>{const b=document.createElement('button');b.className='btn small';b.textContent=t;b.onclick=fn;b.disabled=!!dis;row.appendChild(b)};
if(!g.locked){mk('Cancel',()=>{g.status='cancelled';save();renderAll()});mk('Reschedule +7d',()=>{const dt=new Date(g.date);dt.setDate(dt.getDate()+7);g.date=dt.toISOString().slice(0,10);g.status='open';save();renderAll()});}
mk(g.locked?'Unlock':'Lock',()=>{g.locked=!g.locked;save();renderAll()});
mk('Delete',()=>{if(confirm('Delete date?')){S.dates=S.dates.filter(x=>x.id!==g.id);save();renderAll()}});
el.appendChild(d)});save();
// calendar
const cal=document.getElementById('calendar');cal.innerHTML=['S','M','T','W','T','F','S'].map(d=>`<div class="dow">${d}</div>`).join('');
const now=new Date(),y=now.getFullYear(),mo=now.getMonth();const first=new Date(y,mo,1).getDay(),days=new Date(y,mo+1,0).getDate();
for(let i=0;i<first;i++)cal.innerHTML+='<div></div>';
for(let d=1;d<=days;d++){const ds=`${y}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const has=S.dates.some(g=>g.date===ds);cal.innerHTML+=`<div class="day ${has?'has':''} ${ds===now.toISOString().slice(0,10)?'today':''}">${d}${has?' ●':''}</div>`}
// gen date select
const gd=document.getElementById('genDate');gd.innerHTML=S.dates.map(g=>`<option value="${g.id}">${g.date} ${g.note||''}</option>`).join('')||'<option value="">— add a date first —</option>'}
// BRIGADES
document.getElementById('addBrigBtn').onclick=()=>{const n=document.getElementById('brigName').value||'New Brigade';S.brigades.push({id:uid(),name:n,employer:document.getElementById('brigEmployer').value||'Independent',cbills:5000000,inventory:[],roster:[],active:[],dropship:true});save();renderAll()};
function renderBrigs(){const el=document.getElementById('brigList');el.innerHTML='';
S.brigades.forEach(b=>{const d=document.createElement('div');d.className='brig';
let tot=S.mode==='TW'?b.active.filter(a=>a.on).reduce((s,a)=>{const m=b.inventory.find(x=>x.id===a.mech);const p=b.roster.find(x=>x.id===a.pilot);return s+(m?adjBV(m.bv,p?p.g:4,p?p.p:5):0)},0):b.active.filter(a=>a.on).reduce((s,a)=>{const m=b.inventory.find(x=>x.id===a.mech);const p=b.roster.find(x=>x.id===a.pilot);return s+(m?m.pv+(p?pvSkill(p.g,p.p)-18:0):0)},0);
d.innerHTML=`<div class="row"><b style="font-family:Orbitron">${b.name}</b><span class="pill">${b.employer}</span><span>C-Bills: <input type="number" value="${b.cbills}" data-cb="${b.id}" style="width:130px"></span><span>Upkeep/mo: <b>${upkeep(b).toLocaleString()} C</b></span><span>Deployed: <b>${tot.toLocaleString()} ${S.mode==='TW'?'BV':'PV'}</b></span><button class="btn small" data-del="${b.id}">Delete</button> <button class="btn small" data-toggle="${b.id}">Active: ON/OFF all</button></div>
<div class="grid2"><div><h4>Inventory (Mechs) <span class="hint">${MECHS.length.toLocaleString()} available</span></h4><div class="row"><input placeholder="🔍 Search ${MECHS.length.toLocaleString()} mechs…" data-msearch="${b.id}" style="flex:1;min-width:140px"><button class="btn small" data-addm="${b.id}">+ Add selected</button></div><div class="row"><select data-msel="${b.id}" style="width:100%">${MECHS.slice(0,50).map(m=>`<option value="${m.n}">${m.ico} ${m.n} — ${val(m)}</option>`).join('')}</select></div><table><tr><th></th><th>Mech</th><th>${S.mode==='TW'?'BV @4/5':'PV'}</th><th>C-Bills</th><th></th></tr>${b.inventory.map(m=>`<tr><td class="mech-ico">${m.ico}</td><td>${m.n}</td><td>${val(m)}</td><td>${m.cb.toLocaleString()}</td><td><button class="btn small" data-rmm="${b.id}:${m.id}">x</button></td></tr>`).join('')}</table></div>
<div><h4>MechWarriors</h4><div class="row"><input placeholder="Name" data-pn="${b.id}"><input placeholder="G" type="number" value="4" min="0" max="8" style="width:50px" data-pg="${b.id}"><input placeholder="P" type="number" value="5" min="0" max="8" style="width:50px" data-pp="${b.id}"><button class="btn small" data-addp="${b.id}">+ Pilot</button></div><table><tr><th>Pilot</th><th>G/P</th><th>Mod</th><th></th></tr>${b.roster.map(p=>`<tr><td>${p.n}</td><td>${p.g}/${p.p}</td><td>x${bvMult(p.g,p.p)}</td><td><button class="btn small" data-rmp="${b.id}:${p.id}">x</button></td></tr>`).join('')}</table>
<h4>Dropship Load (next game)</h4><table><tr><th>On</th><th>Mech</th><th>Pilot</th><th>Adj ${S.mode==='TW'?'BV':'PV'}</th></tr>${b.active.map((a,i)=>{const m=b.inventory.find(x=>x.id===a.mech);const p=b.roster.find(x=>x.id===a.pilot);const adj=m&&p?(S.mode==='TW'?adjBV(m.bv,p.g,p.p):m.pv+(pvSkill(p.g,p.p)-18)):(m?(S.mode==='TW'?m.bv:m.pv):0);return `<tr><td><input type="checkbox" ${a.on?'checked':''} data-aon="${b.id}:${i}"></td><td><select data-amech="${b.id}:${i}"><option value="">—</option>${b.inventory.map(m2=>`<option value="${m2.id}" ${m2.id===a.mech?'selected':''}>${m2.n}</option>`).join('')}</select></td><td><select data-apilot="${b.id}:${i}"><option value="">—</option>${b.roster.map(p2=>`<option value="${p2.id}" ${p2.id===a.pilot?'selected':''}>${p2.n} ${p2.g}/${p2.p}</option>`).join('')}</select></td><td>${adj.toLocaleString()}</td></tr>`}).join('')}</table><button class="btn small" data-adda="${b.id}">+ Load slot</button></div></div>`;
el.appendChild(d)});
// wire
el.querySelectorAll('[data-cb]').forEach(i=>i.onchange=()=>{S.brigades.find(b=>b.id===i.dataset.cb).cbills=+i.value;save();renderBrigs()});
el.querySelectorAll('[data-del]').forEach(x=>x.onclick=()=>{S.brigades=S.brigades.filter(b=>b.id!==x.dataset.del);save();renderAll()});
el.querySelectorAll('[data-toggle]').forEach(x=>x.onclick=()=>{const b=S.brigades.find(v=>v.id===x.dataset.toggle);b.active.forEach(a=>a.on=!a.on);save();renderAll()});
el.querySelectorAll('[data-msearch]').forEach(inp=>inp.oninput=()=>{const b=S.brigades.find(v=>v.id===inp.dataset.msearch);const q=inp.value.toLowerCase().trim();const sel=el.querySelector(`[data-msel="${b.id}"]`);const hits=(q?MECHS.filter(m=>m.n.toLowerCase().includes(q)):MECHS).slice(0,100);sel.innerHTML=hits.map(m=>`<option value="${m.n.replace(/"/g,'&quot;')}">${m.ico} ${m.n} — ${val(m)}</option>`).join('')||'<option value="">No matches</option>'});
el.querySelectorAll('[data-addm]').forEach(x=>x.onclick=()=>{const b=S.brigades.find(v=>v.id===x.dataset.addm);const sel=el.querySelector(`[data-msel="${b.id}"]`);const m=MECHS.find(v=>v.n===sel.value)||MECHS[0];if(!m)return toast('No mech selected');const {canon,...rest}=m;b.inventory.push({id:uid(),...rest});save();renderAll();toast(`Added ${m.n}`)});
el.querySelectorAll('[data-rmm]').forEach(x=>x.onclick=()=>{const[bi,mi]=x.dataset.rmm.split(':');const b=S.brigades.find(v=>v.id===bi);b.inventory=b.inventory.filter(m=>m.id!==mi);save();renderAll()});
el.querySelectorAll('[data-addp]').forEach(x=>x.onclick=()=>{const b=S.brigades.find(v=>v.id===x.dataset.addp);b.roster.push({id:uid(),n:el.querySelector(`[data-pn="${b.id}"]`).value||'MechWarrior',g:+el.querySelector(`[data-pg="${b.id}"]`).value||4,p:+el.querySelector(`[data-pp="${b.id}"]`).value||5});save();renderAll()});
el.querySelectorAll('[data-rmp]').forEach(x=>x.onclick=()=>{const[bi,pi]=x.dataset.rmp.split(':');const b=S.brigades.find(v=>v.id===bi);b.roster=b.roster.filter(p=>p.id!==pi);save();renderAll()});
el.querySelectorAll('[data-adda]').forEach(x=>x.onclick=()=>{S.brigades.find(b=>b.id===x.dataset.adda).active.push({mech:'',pilot:'',on:true});save();renderAll()});
el.querySelectorAll('[data-aon]').forEach(c=>c.onchange=()=>{const[bi,i]=c.dataset.aon.split(':');S.brigades.find(b=>b.id===bi).active[+i].on=c.checked;save();renderAll()});
el.querySelectorAll('[data-amech]').forEach(s=>s.onchange=()=>{const[bi,i]=s.dataset.amech.split(':');S.brigades.find(b=>b.id===bi).active[+i].mech=s.value;save();renderAll()});
el.querySelectorAll('[data-apilot]').forEach(s=>s.onchange=()=>{const[bi,i]=s.dataset.apilot.split(':');S.brigades.find(b=>b.id===bi).active[+i].pilot=s.value;save();renderAll()});
}
// SCENARIOS
document.getElementById('genBtn').onclick=()=>{
const gid=document.getElementById('genDate').value;if(!gid)return toast('Create a game date first');
const n=+document.getElementById('genCount').value||10;
const pool=[...MISSIONS].sort(()=>Math.random()-.5).slice(0,Math.min(n,MISSIONS.length));
while(pool.length<n)pool.push(MISSIONS[Math.floor(Math.random()*MISSIONS.length)]);
pool.forEach((m,idx)=>{const opfor=['Green (+0)','Regular (+5% BV)','Veteran (+12% BV, -1 enemy skill)','Elite (+20% BV, -2 skill)'][Math.floor(Math.random()*4)];
S.scenarios.push({id:uid(),gameDateId:gid,title:`${m.t} — Op ${String(S.scenarios.length+1).padStart(2,'0')}`,type:m.t,backstory:`[${S.era}] ${m.d} Employer: ${['Federated Suns','Draconis Combine','Free Worlds League','Hinterlands militia','Independent corp'][Math.floor(Math.random()*5)]}.`,objectives:m.obj.map(o=>({id:uid(),text:o,payout:Math.round(m.pay/m.obj.length),enabled:true,by:''})),map:m.map,opfor,status:'available',salvage:{}})});
save();renderAll();toast(`Generated ${n} scenarios`)};
function renderScens(){const el=document.getElementById('scenarioList');el.innerHTML='';
let list=S.scenarios.filter(s=>s.status!=='discarded');
if(!document.getElementById('includeOld').checked){const gid=document.getElementById('genDate').value;list=list.filter(s=>s.gameDateId===gid)}
list.forEach(s=>{const d=document.createElement('div');d.className='scen'+(s.status==='active'?' active':'');
d.innerHTML=`<span class="pill">${s.status.toUpperCase()}</span> <span class="hint">${s.gameDateId?'':''}</span><h3>${s.title}</h3><p>${s.backstory}</p><p class="hint">OpFor: ${s.opfor} | Map ${s.map.size} ${s.map.loc}</p><div class="row"><button class="btn small" data-view="${s.id}">Inspect</button><button class="btn small" data-act="${s.id}">Activate</button><button class="btn small" data-dis="${s.id}">Discard</button></div>`;
el.appendChild(d)});
el.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{S.selScenario=b.dataset.view;save();renderInspector()});
el.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{S.scenarios.forEach(x=>{if(x.gameDateId===S.scenarios.find(y=>y.id===b.dataset.act).gameDateId&&x.status==='active')x.status='available'});S.scenarios.find(x=>x.id===b.dataset.act).status='active';S.activePredrop=b.dataset.act;save();renderAll()});
el.querySelectorAll('[data-dis]').forEach(b=>b.onclick=()=>{S.scenarios.find(x=>x.id===b.dataset.dis).status='discarded';save();renderAll()});
renderInspector();renderPredropSel()}
function renderInspector(){const el=document.getElementById('inspector');const s=S.scenarios.find(x=>x.id===S.selScenario);
if(!s){el.innerHTML='<p class="hint">Select a scenario.</p>';return}
el.innerHTML=`<h3>${s.title}</h3><p>${s.backstory}</p><p><b>OpFor modifier:</b> ${s.opfor}</p>
<p><b>Map:</b> ${s.map.size} — ${s.map.loc} — ${s.map.ter} — ${s.map.cond}</p>
<h4>Objectives (accept / enable)</h4><table><tr><th>✓</th><th>Objective</th><th>Payout C</th><th>Accepted by</th></tr>${s.objectives.map(o=>`<tr><td><input type="checkbox" ${o.enabled?'checked':''} data-oen="${s.id}:${o.id}"></td><td>${o.text}</td><td><input type="number" value="${o.payout}" style="width:110px" data-opay="${s.id}:${o.id}"></td><td><select data-oby="${s.id}:${o.id}"><option value="">—</option>${S.brigades.map(b=>`<option ${o.by===b.id?'selected':''} value="${b.id}">${b.name}</option>`).join('')}</select></td></tr>`).join('')}</table>
<h4>Salvage Rights %</h4>${S.brigades.map(b=>`<div class="row"><span>${b.name}</span><input type="range" min="0" max="100" value="${s.salvage[b.id]||30}" data-sal="${s.id}:${b.id}"><span data-salv="${s.id}:${b.id}">${s.salvage[b.id]||30}%</span></div>`).join('')||'<p class="hint">No brigades yet.</p>'}`;
el.querySelectorAll('[data-oen]').forEach(c=>c.onchange=()=>{const[si,oi]=c.dataset.oen.split(':');S.scenarios.find(x=>x.id===si).objectives.find(o=>o.id===oi).enabled=c.checked;save()});
el.querySelectorAll('[data-opay]').forEach(c=>c.onchange=()=>{const[si,oi]=c.dataset.opay.split(':');S.scenarios.find(x=>x.id===si).objectives.find(o=>o.id===oi).payout=+c.value;save()});
el.querySelectorAll('[data-oby]').forEach(c=>c.onchange=()=>{const[si,oi]=c.dataset.oby.split(':');S.scenarios.find(x=>x.id===si).objectives.find(o=>o.id===oi).by=c.value;save()});
el.querySelectorAll('[data-sal]').forEach(c=>c.oninput=()=>{const[si,bi]=c.dataset.sal.split(':');S.scenarios.find(x=>x.id===si).salvage[bi]=+c.value;el.querySelector(`[data-salv="${si}:${bi}"]`).textContent=c.value+'%';save()});
}
// PREDROP
function renderPredropSel(){const sel=document.getElementById('predropSelect');const act=S.scenarios.filter(s=>s.status==='active'||s.status==='available');sel.innerHTML=act.map(s=>`<option value="${s.id}" ${s.id===S.activePredrop?'selected':''}>${s.title} [${s.status}]</option>`).join('')||'<option value="">—</option>';if(!S.activePredrop&&act[0])S.activePredrop=act[0].id;sel.onchange=()=>{S.activePredrop=sel.value;save();renderPredrop()};renderPredrop()}
document.getElementById('refreshPredrop').onclick=()=>renderPredrop();
function renderPredrop(){const el=document.getElementById('predropOut');const s=S.scenarios.find(x=>x.id===S.activePredrop);if(!s){el.innerHTML='<p class="hint">No scenario selected.</p>';return}
let rows='';let grandTW=0,grandAS=0;
S.brigades.forEach(b=>{b.active.filter(a=>a.on).forEach(a=>{const m=b.inventory.find(x=>x.id===a.mech);const p=b.roster.find(x=>x.id===a.pilot);if(!m)return;
const base=S.mode==='TW'?m.bv:m.pv;const adj=S.mode==='TW'&&p?adjBV(m.bv,p.g,p.p):(!p?base:(m.pv+(pvSkill(p.g,p.p)-18)));
const opBonus=S.mode==='TW'?Math.round(adj*0.08):Math.round(adj*0.05); // OpFor + conditions transparent bump
const fin=adj+opBonus;grandTW+=S.mode==='TW'?fin:0;grandAS+=S.mode==='TW'?0:fin;
rows+=`<tr><td>${b.name}</td><td class="mech-ico">${m.ico}</td><td>${m.n}</td><td>${p?p.n+' '+p.g+'/'+p.p:'— (4/5)'}</td><td>${base.toLocaleString()}</td><td>${S.mode==='TW'?'x'+(p?bvMult(p.g,p.p):1):(p?'PV skill '+pvSkill(p.g,p.p):'PV 18')}</td><td>+${opBonus} OpFor/terrain</td><td><b>${fin.toLocaleString()}</b></td></tr>`})});
const assetBV=S.mode==='TW'?1200:28;
el.innerHTML=`<h3>${s.title} — ${S.mode==='TW'?'Total Warfare (BV)':'Alpha Strike (PV)'}</h3>
<p><b>Setup:</b> Map ${s.map.size} at ${s.map.loc} (${s.map.ter}). ${s.map.cond}. OpFor: ${s.opfor}. GM assets: Sensor post (BV ${assetBV}), convoy trucks x2 — place per objectives before first turn.</p>
<table><tr><th>Brigade</th><th></th><th>Mech</th><th>Pilot (recorded)</th><th>Base</th><th>Skill mod</th><th>Scenario mod</th><th>Deployed</th></tr>${rows||'<tr><td colspan=8>No active forces. Activate brigades first.</td></tr>'}</table>
<p><b>Force total: ${(S.mode==='TW'?grandTW:grandAS).toLocaleString()} ${S.mode==='TW'?'BV':'PV'}</b> (base + pilot skill + transparent OpFor/condition bump). Base skills unchanged on roster — modifiers apply to this game only.</p>
<h4>Payouts</h4><table><tr><th>Objective</th><th>Enabled</th><th>By</th><th>C-Bills</th></tr>${s.objectives.map(o=>`<tr><td>${o.text}</td><td>${o.enabled?'yes':'no'}</td><td>${(S.brigades.find(b=>b.id===o.by)||{}).name||'—'}</td><td>${o.payout.toLocaleString()}</td></tr>`).join('')}</table>`}
// EXPORT CSV (Google Sheets friendly)
document.getElementById('exportBtn').onclick=()=>{
const s=S.scenarios.find(x=>x.id===S.activePredrop)||S.scenarios.find(x=>x.status==='active');
let csv='BT Quick Contract Export,'+new Date().toISOString()+',Era: '+S.era+',Mode: '+S.mode+'\n\nFORCES,Brigade,Mech,Pilot,G/P,Base,Deployed\n';
S.brigades.forEach(b=>{b.active.filter(a=>a.on).forEach(a=>{const m=b.inventory.find(x=>x.id===a.mech);const p=b.roster.find(x=>x.id===a.pilot);if(!m)return;const base=S.mode==='TW'?m.bv:m.pv;const dep=S.mode==='TW'?(p?adjBV(m.bv,p.g,p.p):m.bv):(p?m.pv+(pvSkill(p.g,p.p)-18):m.pv);csv+=`FORCE,${b.name},${m.n},${p?p.n:''},${p?p.g+'/'+p.p:'4/5'},${base},${dep}\n`})});
csv+='\nOBJECTIVES,Objective,Enabled,AcceptedBy,Payout\n';if(s)s.objectives.forEach(o=>{csv+=`OBJECTIVE,"${o.text}",${o.enabled},${(S.brigades.find(b=>b.id===o.by)||{}).name||''},${o.payout}\n`});
csv+=`\nMAP,Size,Location,Terrain,Conditions\nMAP,"${s?s.map.size:''}","${s?s.map.loc:''}","${s?s.map.ter:''}","${s?s.map.cond:''}"\n`;
const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bt-scenario.csv';a.click();toast('CSV downloaded — import into Google Sheets')};
// SETTINGS
function renderMechRef(){const ref=document.getElementById('mechRef');if(!ref)return;const show=MECHS.slice(0,120);ref.innerHTML=`<p class="hint">Source: ${MECH_SOURCE}. Showing ${show.length} of ${MECHS.length.toLocaleString()} — use Brigade search to find any unit.</p>`+show.map(m=>`<div class="pill" title="${m.wc||''} ${m.tons||''}t ${m.yr||''}">${m.ico} ${m.n} ${m.bv}BV/${m.pv}PV</div>`).join('');const h=ref.previousElementSibling;if(h&&h.tagName==='H3')h.textContent=`Mech Catalog — ${MECHS.length.toLocaleString()} units (BV/PV/C-Bills)`}
renderMechRef();
document.getElementById('seedBtn').onclick=()=>{if(!confirm('Load demo campaign?'))return;S.dates=[{id:uid(),date:new Date().toISOString().slice(0,10),note:'Shop Night — demo',status:'open',locked:false}];
const pick=n=>{const m=MECHS.find(v=>v.n.toLowerCase().includes(n.toLowerCase()))||MECHS[0];const {canon,...rest}=m;return {id:uid(),...rest}};
const b1={id:uid(),name:'Iron Jackals',employer:'Federated Suns',cbills:5200000,inventory:[pick('Marauder MAD-3R'),pick('Hunchback HBK-4G')],roster:[{id:uid(),n:'Vera "Hammer" Kao',g:3,p:4},{id:uid(),n:'Dax Renn',g:4,p:5}],active:[],dropship:true};
b1.active=[{mech:b1.inventory[0].id,pilot:b1.roster[0].id,on:true},{mech:b1.inventory[1].id,pilot:b1.roster[1].id,on:true}];S.brigades=[b1];save();renderAll()};
document.getElementById('wipeBtn').onclick=()=>{if(confirm('Wipe all?')){S={era:ERAS[2],mode:'TW',dates:[],brigades:[],scenarios:[]};save();renderAll()}};
document.getElementById('jsonBtn').onclick=()=>{const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bt-backup.json';a.click()};
document.getElementById('importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{S=JSON.parse(r.result);save();renderAll()};r.readAsText(f)};
function renderAll(){save();renderDates();renderBrigs();renderScens()}
renderAll();
