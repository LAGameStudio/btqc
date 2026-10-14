const LS='bqct_state_v1';
const ERAS=['3025-3039 Succession Wars','3049-3052 Clan Invasion','3050-3067 Late Invasion / Civil War (default)','3068-3085 Jihad','3086-3152 Early Republic / Dark Age','3152+ ilClan'];
const FALLBACK_MECHS=[
{n:'Atlas AS7-D',bv:1897,pv:48,cb:9634000,wc:'Assault',rl:'Juggernaut'}, {n:'Marauder MAD-3R',bv:1363,pv:36,cb:6325000,wc:'Heavy',rl:'Sniper'},
{n:'Timber Wolf (Mad Cat) Prime',bv:2737,pv:52,cb:24360000,wc:'Heavy',rl:'Brawler'}, {n:'Summoner (Thor) Prime',bv:2295,pv:45,cb:22900000,wc:'Heavy',rl:'Striker'},
{n:'Locust LCT-1V',bv:432,pv:16,cb:1519000,wc:'Light',rl:'Scout'}, {n:'Jenner JR7-D',bv:875,pv:24,cb:4465000,wc:'Light',rl:'Striker'},
{n:'Hunchback HBK-4G',bv:1041,pv:28,cb:3587000,wc:'Medium',rl:'Juggernaut'}, {n:'Warhammer WHM-6R',bv:1299,pv:35,cb:6023000,wc:'Heavy',rl:'Brawler'},
{n:'Raven RVN-3L',bv:906,pv:22,cb:4840000,wc:'Light',rl:'Scout'}, {n:'Catapult CPLT-C1',bv:1399,pv:33,cb:6382000,wc:'Heavy',rl:'Missile Boat'},
{n:'Awesome AWS-8Q',bv:1605,pv:40,cb:6644000,wc:'Assault',rl:'Sniper'}];
let MECHS=[...FALLBACK_MECHS];
let MECH_SOURCE='built-in fallback (12 units)';
// Icon conveys battlefield role (MekBay role field); weight class is the fallback.
const ROLE_ICONS={'Brawler':'👊','Striker':'🪓','Scout':'🔭','Missile Boat':'🚀','Sniper':'🎯','Skirmisher':'⚔️','Juggernaut':'🛡️','Ambusher':'🥷','Fire Support':'🔥','Fire':'🔥','Spotter':'👁️','None':''};
const ROLE_LABELS={'Brawler':'Brawler (close assault)','Striker':'Striker (fast hit-and-run)','Scout':'Scout (recon / spotting)','Missile Boat':'Missile Boat (indirect fire)','Sniper':'Sniper (long range)','Skirmisher':'Skirmisher (mobile fire)','Juggernaut':'Juggernaut (heavy anchor)','Ambusher':'Ambusher (urban / close)','Fire Support':'Fire Support (flamers / area denial)','Fire':'Fire (flamers)'};
function icoFor(role,wc,fm){if(fm>=3)return '🔥';if(role&&ROLE_ICONS[role])return ROLE_ICONS[role];return wc==='Light'?'⚡':wc==='Assault'||String(wc||'').includes('Assault')?'♜':wc&&String(wc).includes('Colossal')?'🗿':wc==='Heavy'?'♞':'🔱'}
function roleOf(m){return m&&(m.rl||(MECHS.find(c=>c.n===m.n)||{}).rl)||'None'}
function flamersOf(m){if(!m)return 0;if(m.fm!=null)return m.fm;const c=MECHS.find(x=>x.n===m.n);return c&&c.fm||0}
// Full MekBay catalog (type=Mek, 4,295 units, BV+PV+cost) generated from https://github.com/MegaMek/mekbay via db.mekbay.com/units.json
fetch('mechs.json').then(r=>{if(!r.ok)throw 0;return r.json()}).then(j=>{
  if(Array.isArray(j)&&j.length>100){MECHS=j.map(u=>({...u,ico:icoFor(u.rl,u.wc,u.fm)}));MECH_SOURCE=`MekBay catalog (${MECHS.length.toLocaleString()} Mek units, db.mekbay.com 2026-09-25)`;renderBrigs();renderMechRef();toast(`Loaded ${MECHS.length.toLocaleString()} MekBay mechs`)}
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
// Calendar view state (declared early: setMode() renders before the calendar code is defined)
let calView={y:null,m:null};
const MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];
// BV skill multiplier table (Classic, simplified from TM p.315)
function bvMult(g,p){const t={'0/0':2.1,'1/1':1.8,'2/2':1.5,'3/3':1.25,'3/4':1.15,'4/4':1.1,'4/5':1.0,'5/5':0.9,'5/6':0.8,'6/6':0.75};const k=g+'/'+p;if(t[k])return t[k];let m=1.0+(4-g)*0.2+(5-p)*0.1;return Math.max(0.5,Math.round(m*100)/100)}
function pvSkill(g,p){return Math.max(8,Math.round((g+p)*2.2))} // rough AS PV w/ skill
function adjBV(bv,g,p){return Math.round(bv*bvMult(g,p))}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2200)}
function upkeep(b){let mv=b.inventory.filter(m=>b.active.some(a=>a.mech===m.id&&a.on)).reduce((s,m)=>s+m.cb,0);let men=b.active.filter(a=>a.on).length*15000;return Math.round(mv*0.04/12+men+25000)}
function val(m){return S.mode==='TW'?m.bv+' BV':m.pv+' PV'}
function eraBounds(){const m=String(S.era||'').match(/(\d{3,4})\s*(?:[-\u2013]\s*(\d{3,4})|\+)/);if(!m)return null;return [+m[1],m[2]?+m[2]:9999]}
function eraTag(yr){const b=eraBounds();if(yr==null||isNaN(+yr)||!b)return '<span class="hint">—</span>';yr=+yr;if(yr<b[0])return `${yr} <span class="pill legend">LEGENDARY</span>`;if(yr>b[1])return `${yr} <span class="pill exp">EXPERIMENTAL</span>`;return `${yr} <span class="pill contemp">CONTEMPORARY</span>`}
// TABS
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.getElementById('tab-'+b.dataset.tab).classList.add('active')});
// ERA + MODE
const eraSel=document.getElementById('eraSelect');ERAS.forEach(e=>{const o=document.createElement('option');o.textContent=e;eraSel.appendChild(o)});eraSel.value=S.era;eraSel.onchange=()=>{S.era=eraSel.value;save();renderAll()};
function setMode(m){S.mode=m;save();document.getElementById('modeTW').classList.toggle('active',m==='TW');document.getElementById('modeAS').classList.toggle('active',m==='AS');renderAll()}
document.getElementById('modeTW').onclick=()=>setMode('TW');document.getElementById('modeAS').onclick=()=>setMode('AS');setMode(S.mode||'TW');
// SCHEDULE
document.getElementById('addDateBtn').onclick=()=>{const d=document.getElementById('newDate').value;if(!d)return toast('Pick a date');S.dates.push({id:uid(),date:d,note:document.getElementById('newDateNote').value,status:'open',locked:false});save();renderAll();toast('Game date added')};
function todayStr(){return new Date().toISOString().slice(0,10)}
function upcomingGameId(){const t=todayStr();return (S.dates.filter(g=>g.status==='open'&&!g.locked&&g.date>=t).sort((a,b)=>a.date.localeCompare(b.date))[0]||{}).id}
function calShift(delta){if(calView.y==null){const n=new Date();calView={y:n.getFullYear(),m:n.getMonth()}}const d=new Date(calView.y,calView.m+delta,1);calView={y:d.getFullYear(),m:d.getMonth()};renderCalendar()}
function renderCalendar(){
const cal=document.getElementById('calendar');if(!cal)return;
const t=todayStr();if(calView.y==null){const n=new Date();calView={y:n.getFullYear(),m:n.getMonth()}}
const y=calView.y,m=calView.m,upId=upcomingGameId();
const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
let html=`<div class="calhead"><button class="btn small" data-cal="-1">‹</button><span class="caltitle">${MONTH_NAMES[m]} ${y}</span><button class="btn small" data-cal="1">›</button><button class="btn small" data-cal="0">Today</button></div><div class="calgrid">`;
html+=['S','M','T','W','T','F','S'].map(d=>`<div class="dow">${d}</div>`).join('');
for(let i=0;i<first;i++)html+='<div class="day pad"></div>';
for(let d=1;d<=days;d++){
const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const gs=S.dates.filter(g=>g.date===ds),live=gs.filter(g=>g.status!=='cancelled');
const cls=['day'];
if(ds<t&&live.length)cls.push('past');
if(ds>t&&live.length)cls.push('future');
if(ds===t)cls.push('today');
if(gs.some(g=>g.id===upId))cls.push('upcomingday');
if(gs.length&&!live.length)cls.push('cancelled');
const title=gs.map(g=>`${g.status.toUpperCase()}${g.locked?' (locked)':''} ${g.note||''}`.trim()).join(' | ');
html+=`<div class="${cls.join(' ')}"${title?` title="${title.replace(/"/g,'&quot;')}"`:''}>${d}${gs.length?`<span class="caldot">${'●'.repeat(Math.min(gs.length,3))}</span>`:''}${gs.some(g=>g.id===upId)?'<span class="calstar">★</span>':''}</div>`}
html+='</div>';
cal.innerHTML=html;
cal.querySelectorAll('[data-cal]').forEach(b=>b.onclick=()=>{const v=+b.dataset.cal;if(v===0){calView={y:null,m:null};renderCalendar()}else calShift(v)});
}
function renderDates(){const el=document.getElementById('dateList');el.innerHTML='';const today=todayStr();
S.dates.sort((a,b)=>a.date.localeCompare(b.date));
const upcomingId=upcomingGameId();
S.dates.forEach(g=>{if(g.date<today&&!g.locked&&g.status==='open'){g.locked=true}
const d=document.createElement('div');d.className='date-row'+(g.locked?' locked':'');
const up=g.id===upcomingId?' <span class="pill upcoming">UPCOMING</span>':'';
d.innerHTML=`<b>${g.date}</b> <span class="pill ${g.locked?'lock':g.status==='cancelled'?'cancel':'open'}">${g.locked?'LOCKED':g.status.toUpperCase()}</span>${up} <span>${g.note||''}</span><div class="row"></div>`;
const row=d.querySelector('.row');
const mk=(t,fn,dis)=>{const b=document.createElement('button');b.className='btn small';b.textContent=t;b.onclick=fn;b.disabled=!!dis;row.appendChild(b)};
if(!g.locked){mk('Cancel',()=>{g.status='cancelled';save();renderAll()});mk('Reschedule',()=>{if(row.querySelector('[data-resched]'))return;const inp=document.createElement('input');inp.type='date';inp.value=g.date;inp.setAttribute('data-resched','1');const set=document.createElement('button');set.className='btn small';set.textContent='Set date';set.onclick=()=>{if(!inp.value)return toast('Pick a date');g.date=inp.value;g.status='open';save();renderAll();toast('Game date rescheduled')};row.appendChild(inp);row.appendChild(set);inp.focus()});}
mk(g.locked?'Unlock':'Lock',()=>{g.locked=!g.locked;save();renderAll()});
mk('Delete',()=>{if(confirm('Delete date?')){S.dates=S.dates.filter(x=>x.id!==g.id);save();renderAll()}});
el.appendChild(d)});save();
// calendar
renderCalendar();
// gen date select
const gd=document.getElementById('genDate');gd.innerHTML=S.dates.map(g=>`<option value="${g.id}">${g.date} ${g.note||''}</option>`).join('')||'<option value="">— add a date first —</option>'}
// BRIGADES
document.getElementById('addBrigBtn').onclick=()=>{const n=document.getElementById('brigName').value||'New Brigade';S.brigades.push({id:uid(),name:n,employer:document.getElementById('brigEmployer').value||'Independent',cbills:5000000,inventory:[],roster:[],active:[],dropship:true});save();renderAll()};
function renderBrigs(){const el=document.getElementById('brigList');el.innerHTML='';
S.brigades.forEach(b=>{const d=document.createElement('div');d.className='brig';
let tot=S.mode==='TW'?b.active.filter(a=>a.on).reduce((s,a)=>{const m=b.inventory.find(x=>x.id===a.mech);const p=b.roster.find(x=>x.id===a.pilot);return s+(m?adjBV(m.bv,p?p.g:4,p?p.p:5):0)},0):b.active.filter(a=>a.on).reduce((s,a)=>{const m=b.inventory.find(x=>x.id===a.mech);const p=b.roster.find(x=>x.id===a.pilot);return s+(m?m.pv+(p?pvSkill(p.g,p.p)-18:0):0)},0);
d.innerHTML=`<div class="row"><b style="font-family:Orbitron">${b.name}</b><span class="pill">${b.employer}</span><span>C-Bills: <input type="number" value="${b.cbills}" data-cb="${b.id}" style="width:130px"></span><span>Upkeep/mo: <b>${upkeep(b).toLocaleString()} C</b></span><span>Deployed: <b>${tot.toLocaleString()} ${S.mode==='TW'?'BV':'PV'}</b></span><button class="btn small" data-del="${b.id}">Delete</button> <button class="btn small" data-toggle="${b.id}">Active: ON/OFF all</button></div>
<div class="grid2"><div><h4>Inventory (Mechs) <span class="hint">${MECHS.length.toLocaleString()} available</span></h4><div class="row"><input placeholder="🔍 Search ${MECHS.length.toLocaleString()} mechs…" data-msearch="${b.id}" style="flex:1;min-width:140px"><button class="btn small" data-addm="${b.id}">+ Add selected</button></div><div class="row"><select data-msel="${b.id}" style="width:100%">${MECHS.slice(0,50).map(m=>`<option value="${m.n}">${m.ico} ${m.n} — ${val(m)}${m.yr?' · '+m.yr:''}${m.rl&&m.rl!=='None'?' · '+m.rl:''}</option>`).join('')}</select></div><table><tr><th></th><th>Mech</th><th>Role</th><th>${S.mode==='TW'?'BV @4/5':'PV'}</th><th>C-Bills</th><th>Era</th><th></th></tr>${b.inventory.map(m=>`<tr><td class="mech-ico" title="${(ROLE_LABELS[roleOf(m)]||'Role: '+roleOf(m))}${flamersOf(m)>=3?` · ${flamersOf(m)} flamers`:''}">${icoFor(roleOf(m),m.wc,flamersOf(m))}</td><td>${m.n}</td><td class="hint">${(ROLE_LABELS[roleOf(m)]||roleOf(m)||'—').replace(/\s*\(.*/,'')}${flamersOf(m)>=3?' 🔥':''}</td><td>${val(m)}</td><td>${m.cb.toLocaleString()}</td><td>${eraTag(m.yr)}</td><td><button class="btn small" data-rmm="${b.id}:${m.id}">x</button></td></tr>`).join('')}</table></div>
<div><h4>MechWarriors</h4><div class="row"><input placeholder="Name" data-pn="${b.id}"><input placeholder="G" type="number" value="4" min="0" max="8" style="width:50px" data-pg="${b.id}"><input placeholder="P" type="number" value="5" min="0" max="8" style="width:50px" data-pp="${b.id}"><button class="btn small" data-addp="${b.id}">+ Pilot</button></div><table><tr><th>Pilot</th><th>G/P</th><th>Mod</th><th></th></tr>${b.roster.map(p=>`<tr><td>${p.n}</td><td>${p.g}/${p.p}</td><td>x${bvMult(p.g,p.p)}</td><td><button class="btn small" data-rmp="${b.id}:${p.id}">x</button></td></tr>`).join('')}</table>
<h4>Dropship Load (next game)</h4><table><tr><th>On</th><th>Mech</th><th>Pilot</th><th>Adj ${S.mode==='TW'?'BV':'PV'}</th></tr>${b.active.map((a,i)=>{const m=b.inventory.find(x=>x.id===a.mech);const p=b.roster.find(x=>x.id===a.pilot);const adj=m&&p?(S.mode==='TW'?adjBV(m.bv,p.g,p.p):m.pv+(pvSkill(p.g,p.p)-18)):(m?(S.mode==='TW'?m.bv:m.pv):0);return `<tr><td><input type="checkbox" ${a.on?'checked':''} data-aon="${b.id}:${i}"></td><td><select data-amech="${b.id}:${i}"><option value="">—</option>${b.inventory.map(m2=>`<option value="${m2.id}" ${m2.id===a.mech?'selected':''}>${m2.n}</option>`).join('')}</select></td><td><select data-apilot="${b.id}:${i}"><option value="">—</option>${b.roster.map(p2=>`<option value="${p2.id}" ${p2.id===a.pilot?'selected':''}>${p2.n} ${p2.g}/${p2.p}</option>`).join('')}</select></td><td>${adj.toLocaleString()}</td></tr>`}).join('')}</table><button class="btn small" data-adda="${b.id}">+ Load slot</button></div></div>`;
el.appendChild(d)});
// wire
el.querySelectorAll('[data-cb]').forEach(i=>i.onchange=()=>{S.brigades.find(b=>b.id===i.dataset.cb).cbills=+i.value;save();renderBrigs()});
el.querySelectorAll('[data-del]').forEach(x=>x.onclick=()=>{const b=S.brigades.find(v=>v.id===x.dataset.del);if(!b)return;if(!confirm(`Delete brigade '${b.name}' and all its mechs, pilots and dropship load?`))return;S.brigades=S.brigades.filter(v=>v.id!==b.id);save();renderAll()});
el.querySelectorAll('[data-toggle]').forEach(x=>x.onclick=()=>{const b=S.brigades.find(v=>v.id===x.dataset.toggle);b.active.forEach(a=>a.on=!a.on);save();renderAll()});
el.querySelectorAll('[data-msearch]').forEach(inp=>inp.oninput=()=>{const b=S.brigades.find(v=>v.id===inp.dataset.msearch);const q=inp.value.toLowerCase().trim();const sel=el.querySelector(`[data-msel="${b.id}"]`);const hits=(q?MECHS.filter(m=>m.n.toLowerCase().includes(q)):MECHS).slice(0,100);sel.innerHTML=hits.map(m=>`<option value="${m.n.replace(/"/g,'&quot;')}">${m.ico} ${m.n} — ${val(m)}${m.yr?' · '+m.yr:''}${m.rl&&m.rl!=='None'?' · '+m.rl:''}</option>`).join('')||'<option value="">No matches</option>'});
el.querySelectorAll('[data-addm]').forEach(x=>x.onclick=()=>{const b=S.brigades.find(v=>v.id===x.dataset.addm);const sel=el.querySelector(`[data-msel="${b.id}"]`);const m=MECHS.find(v=>v.n===sel.value)||MECHS[0];if(!m)return toast('No mech selected');const {canon,...rest}=m;b.inventory.push({id:uid(),...rest});save();renderAll();toast(`Added ${m.n}`)});
el.querySelectorAll('[data-rmm]').forEach(x=>x.onclick=()=>{const[bi,mi]=x.dataset.rmm.split(':');const b=S.brigades.find(v=>v.id===bi);const m=b&&b.inventory.find(v=>v.id===mi);if(!b||!m)return;const used=b.active.some(a=>a.mech===mi);if(!confirm(`Remove '${m.n}' from '${b.name}' inventory?${used?' It is assigned to a dropship load slot.':''}`))return;b.inventory=b.inventory.filter(v=>v.id!==mi);save();renderAll()});
el.querySelectorAll('[data-addp]').forEach(x=>x.onclick=()=>{const b=S.brigades.find(v=>v.id===x.dataset.addp);b.roster.push({id:uid(),n:el.querySelector(`[data-pn="${b.id}"]`).value||'MechWarrior',g:+el.querySelector(`[data-pg="${b.id}"]`).value||4,p:+el.querySelector(`[data-pp="${b.id}"]`).value||5});save();renderAll()});
el.querySelectorAll('[data-rmp]').forEach(x=>x.onclick=()=>{const[bi,pi]=x.dataset.rmp.split(':');const b=S.brigades.find(v=>v.id===bi);const p=b&&b.roster.find(v=>v.id===pi);if(!b||!p)return;const used=b.active.some(a=>a.pilot===pi);if(!confirm(`Remove pilot '${p.n}' (${p.g}/${p.p}) from '${b.name}' roster?${used?' They are assigned to a dropship load slot.':''}`))return;b.roster=b.roster.filter(v=>v.id!==pi);save();renderAll()});
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
el.querySelectorAll('[data-dis]').forEach(b=>b.onclick=()=>{const s=S.scenarios.find(x=>x.id===b.dataset.dis);if(!s)return;if(!confirm(`Discard scenario '${s.title}'? It will be hidden and cannot be selected again.`))return;s.status='discarded';save();renderAll()});
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
// ODS BRIGADE IMPORT (loose & friendly; matches Example_Brigade_Sheet.ods)
// Minimal dependency-free .ods reader: tiny ZIP central-directory scan +
// DecompressionStream('deflate-raw') + DOMParser. Anything outside the
// expected Brigade/Pilots/Mechs shapes is skipped, never fatal.
async function odsContentXML(file){
const buf=new Uint8Array(await file.arrayBuffer());
const dv=new DataView(buf.buffer,buf.byteOffset,buf.byteLength);
const u16=i=>dv.getUint16(i,true),u32=i=>dv.getUint32(i,true);
let eocd=-1;for(let i=buf.length-22;i>=0&&i>=Math.max(0,buf.length-66000);i--){if(u32(i)===0x06054b50){eocd=i;break}}
if(eocd<0)throw new Error('not an ods/zip file');
const count=u16(eocd+10);let p=u32(eocd+16);
for(let k=0;k<count;k++){if(u32(p)!==0x02014b50)break;
const method=u16(p+10),csize=u32(p+20),nl=u16(p+28),el=u16(p+30),cl=u16(p+32),lh=u32(p+42);
let nm='';for(let j=0;j<nl;j++)nm+=String.fromCharCode(buf[p+46+j]);
if(nm==='content.xml'){
if(method===0)return new TextDecoder().decode(buf.slice(lh+30+u16(lh+26)+u16(lh+28),lh+30+u16(lh+26)+u16(lh+28)+csize));
if(method!==8)throw new Error('unsupported compression');
const raw=buf.slice(lh+30+u16(lh+26)+u16(lh+28),lh+30+u16(lh+26)+u16(lh+28)+csize);
const ds=new DecompressionStream('deflate-raw');
const stream=new Blob([raw]).stream().pipeThrough(ds);
return new TextDecoder().decode(new Uint8Array(await new Response(stream).arrayBuffer()));}
p+=46+nl+el+cl}
throw new Error('content.xml not found')}
function odsGrids(xmlText){
const doc=new DOMParser().parseFromString(xmlText,'application/xml');
if(doc.querySelector('parsererror'))throw new Error('bad content.xml');
const NS='urn:oasis:names:tc:opendocument:xmlns:table:1.0';
const OFF='urn:oasis:names:tc:opendocument:xmlns:office:1.0';
const TXT='urn:oasis:names:tc:opendocument:xmlns:text:1.0';
const out={};
for(const t of doc.getElementsByTagNameNS(NS,'table')){
const sname=t.getAttributeNS(NS,'name')||'Sheet';
const grid=[];
for(const r of t.childNodes){
if(!r.getAttributeNS)continue;
const rr=+r.getAttributeNS(NS,'number-rows-repeated')||1;
const row=[];
for(const c of r.childNodes){
if(!c.getAttributeNS)continue;
const tag=c.localName;
if(tag!=='table-cell'&&tag!=='covered-table-cell')continue;
const rep=Math.min(+c.getAttributeNS(NS,'number-columns-repeated')||1,32);
let v='';
for(const p of c.getElementsByTagNameNS(TXT,'p'))v+=(v?' ':'')+p.textContent.trim();
v=v.trim();
if(!v&&c.getAttributeNS(OFF,'value')!=null&&c.getAttributeNS(OFF,'value')!=='')v=c.getAttributeNS(OFF,'value');
for(let i=0;i<rep&&row.length<32;i++)row.push(v);}
if(row.some(x=>x!=='')){for(let i=0;i<Math.min(rr,3);i++)grid.push([...row])}}
if(grid.length)out[sname]=grid;}
return out}
function odsNum(v){if(v==null)return null;const m=String(v).replace(/[^0-9.\-]/g,'');if(!m||m==='-'||m==='.')return null;const n=parseFloat(m);return isNaN(n)?null:n}
function odsSkill(v,fb){const n=odsNum(v);if(n==null)return fb;return Math.max(0,Math.min(8,Math.round(n)))}
function odsNorm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function odsCatalogMatch(name,variant){
const full=(name+' '+variant).trim();
let m=MECHS.find(v=>v.n===full);if(m)return m;
const nf=odsNorm(full);m=MECHS.find(v=>odsNorm(v.n)===nf);if(m)return m;
const nn=odsNorm(name);const cands=MECHS.filter(v=>odsNorm(v.n).startsWith(nn));
if(cands.length){const nv=odsNorm(variant);return cands.find(v=>odsNorm(v.n).endsWith(nv))||cands[0]}
return null}
document.getElementById('odsFile').onchange=e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
(async()=>{try{
const grids=odsGrids(await odsContentXML(f));
const keys=Object.keys(grids);
const pick=re=>keys.find(k=>re.test(k));
let skipped=0;
// Brigade sheet: label (col A) / value (col B) pairs
let bname='',employer='',cbills=5000000;
const bg=grids[pick(/brigade/i)]||[];
bg.forEach(r=>{const a=(r[0]||'').toLowerCase(),b=(r[1]||'').trim();if(!b)return;
if(/brigade\s*name/.test(a))bname=b;
else if(/employer|servant|employed|allegiance|faction/.test(a))employer=b;
else if(/starting investment|starting.*fund|budget|initial.*fund/.test(a)){const n=odsNum(b);if(n!=null)cbills=Math.round(n)}});
// Pilots sheet: header Name + Piloting/Gunnery, data below
const roster=[];
const pg=grids[pick(/pilot/i)]||[];
let hi=pg.findIndex(r=>{const j=r.join(' ').toLowerCase();return j.includes('name')&&(j.includes('pilot')||j.includes('gunner'))});
if(hi>=0){const H=pg[hi].map(h=>h.toLowerCase());
const ni=H.findIndex(h=>h.includes('name')&&!h.includes('user'));let gi=H.findIndex(h=>h.includes('gunnery')||h==='g');let pi=H.findIndex(h=>h.includes('pilot')&&!h.includes('name')||h==='p');
if(ni<0)ni=0;if(gi<0)gi=2;if(pi<0)pi=1;
for(const r of pg.slice(hi+1)){const nm=(r[ni]||'').trim();if(!nm){continue}
let g=odsSkill(r[pi],4),p=odsSkill(r[gi],5);
const comb=String(r[pi]||'').match(/(\d)\s*\/\s*(\d)/)||String(r[gi]||'').match(/(\d)\s*\/\s*(\d)/);
if(comb){g=Math.max(0,Math.min(8,+comb[1]));p=Math.max(0,Math.min(8,+comb[2]))}
roster.push({id:uid(),n:nm,g,p})}}
// Mechs sheet: Name + Model/Variant + optional BV/PV/C-Bills
const mechs=[];
const mg=grids[pick(/mech/i)]||[];
let mh=mg.findIndex(r=>{const j=r.join(' ').toLowerCase();return j.includes('name')&&(j.includes('model')||j.includes('variant'))});
if(mh>=0){const H=mg[mh].map(h=>h.toLowerCase());
const ni=H.findIndex(h=>h==='name'||h.includes('chassis'));let vi=H.findIndex(h=>h.includes('variant')||h.includes('model'));
const bi=H.findIndex(h=>/\bbv\b/.test(h));const pvi=H.findIndex(h=>/\bpv\b/.test(h));
const ci=H.findIndex(h=>h.includes('c-bill')||h.includes('c bill')||h.includes('cost')||h.includes('value'));
if(ni<0||vi<0){skipped+=mg.length-mh-1}else{
for(const r of mg.slice(mh+1)){const nm=(r[ni]||'').trim(),va=(r[vi]||'').trim();
const nonEmpty=r.filter(x=>x!=='').length;
if(!nm||!va){if(nonEmpty>0)skipped++;continue}
const cat=odsCatalogMatch(nm,va);
const bv=bi>=0?odsNum(r[bi]):null,pvv=pvi>=0?odsNum(r[pvi]):null,cb=ci>=0?odsNum(r[ci]):null;
if(cat)mechs.push({id:uid(),n:cat.n,bv:bv!=null?Math.round(bv):cat.bv,pv:pvv!=null?Math.round(pvv):cat.pv,cb:cb!=null?Math.round(cb):cat.cb,tons:cat.tons,yr:cat.yr,wc:cat.wc,rl:cat.rl,fm:cat.fm,ico:icoFor(cat.rl,cat.wc,cat.fm)});
else if(bv!=null||pvv!=null)mechs.push({id:uid(),n:nm+' '+va,bv:bv!=null?Math.round(bv):800,pv:pvv!=null?Math.round(pvv):20,cb:cb!=null?Math.round(cb):3000000,tons:null,yr:null,wc:'Medium',rl:'None',ico:icoFor('','Medium')});
else skipped++}}}
if(!bname&&!roster.length&&!mechs.length){toast('No brigade data recognised — skipped file');return}
const b={id:uid(),name:bname||f.name.replace(/\.ods$/i,'')||'Imported Brigade',employer:employer||'Independent',cbills,inventory:mechs,roster,active:[],dropship:true};
S.brigades.push(b);save();renderAll();
toast(`Imported '${b.name}': ${mechs.length} mechs, ${roster.length} pilots${skipped?`, skipped ${skipped} rows`:''}`);
}catch(err){console.warn(err);toast('Could not read ODS: '+(err&&err.message||err))}})()};
// IMPORT SHEETS CSV (round-trip of the Export format)
let parsedImport=null;
function parseCSVLine(line){const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(q){if(c==='"'){if(line[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}else{if(c==='"')q=true;else if(c===','){out.push(cur);cur=''}else cur+=c}}out.push(cur);return out.map(s=>s.trim())}
function parseSheetCSV(text){const res={forces:[],objectives:[],map:{size:'',loc:'',ter:'',cond:''},meta:{}};
text.split(/\r?\n/).forEach(line=>{if(!line.trim())return;const c=parseCSVLine(line);const k=(c[0]||'').toUpperCase();
if(k==='FORCE'&&c.length>=5)res.forces.push({brigade:c[1]||'Unnamed Brigade',mech:c[2]||'',pilot:c[3]||'',gp:c[4]||'4/5'});
else if(k==='OBJECTIVE'&&c.length>=5)res.objectives.push({text:c[1]||'',enabled:/^true$/i.test(c[2]||''),by:c[3]||'',payout:parseInt(c[4]||'0',10)||0});
else if(k==='MAP'&&c.length>=5)res.map={size:c[1],loc:c[2],ter:c[3],cond:c[4]};
else if(k==='BT QUICK CONTRACT EXPORT'){res.meta.exported=c[1]||'';const e=(c[2]||'').replace(/^Era:\s*/,'');if(e)res.meta.era=e;const m=(c[3]||'').replace(/^Mode:\s*/,'');if(m)res.meta.mode=m}});
return res}
document.getElementById('importBtn').onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.getElementById('tab-import').classList.add('active');refreshImportDates()};
function refreshImportDates(){const sel=document.getElementById('importDate');if(!sel)return;const cur=sel.value;sel.innerHTML=S.dates.map(g=>`<option value="${g.id}">${g.date} ${g.note||''}</option>`).join('')||'<option value="">— add a game date first —</option>';if(cur&&[...sel.options].some(o=>o.value===cur))sel.value=cur}
function renderImportPreview(){const el=document.getElementById('importPreview');const btn=document.getElementById('applyImportBtn');if(!parsedImport){el.innerHTML='<p class="hint">No CSV parsed yet.</p>';btn.disabled=true;return}
const p=parsedImport;btn.disabled=!(p.forces.length||p.objectives.length);
el.innerHTML=`<p><b>${p.forces.length}</b> force(s), <b>${p.objectives.length}</b> objective(s)${p.meta.era?`, era ${p.meta.era}`:''}${p.meta.mode?`, mode ${p.meta.mode}`:''}.</p>
${p.forces.length?`<table><tr><th>Brigade</th><th>Mech</th><th>Pilot</th><th>G/P</th></tr>${p.forces.map(f=>`<tr><td>${f.brigade}</td><td>${f.mech}</td><td>${f.pilot||'—'}</td><td>${f.gp}</td></tr>`).join('')}</table>`:''}
${p.objectives.length?`<table><tr><th>Objective</th><th>Enabled</th><th>By</th><th>C-Bills</th></tr>${p.objectives.map(o=>`<tr><td>${o.text}</td><td>${o.enabled?'yes':'no'}</td><td>${o.by||'—'}</td><td>${o.payout.toLocaleString()}</td></tr>`).join('')}</table>`:''}
${p.map.size?`<p><b>Map:</b> ${p.map.size} — ${p.map.loc} — ${p.map.ter} — ${p.map.cond}</p>`:''}`}
function brigadeByName(n){let b=S.brigades.find(x=>x.name.toLowerCase()===n.toLowerCase());if(!b){b={id:uid(),name:n,employer:'Imported',cbills:5000000,inventory:[],roster:[],active:[],dropship:true};S.brigades.push(b)}return b}
function mechForInventory(b,mechName){let m=b.inventory.find(x=>x.n===mechName);if(m)return m;const cat=MECHS.find(v=>v.n===mechName)||MECHS.find(v=>v.n.toLowerCase()===mechName.toLowerCase());if(!cat)return null;const {canon,...rest}=cat;m={id:uid(),...rest};b.inventory.push(m);return m}
function pilotForRoster(b,pilotName,gp){let g=4,p=5;const mm=String(gp||'').match(/(\d+)\s*\/\s*(\d+)/);if(mm){g=+mm[1];p=+mm[2]}
let r=b.roster.find(x=>x.n.toLowerCase()===(pilotName||'').toLowerCase());if(!r){r={id:uid(),n:pilotName||'MechWarrior',g,p};b.roster.push(r)}return r}
document.getElementById('csvFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{document.getElementById('csvText').value=r.result;parsedImport=parseSheetCSV(r.result);renderImportPreview();toast(`Parsed ${parsedImport.forces.length} forces, ${parsedImport.objectives.length} objectives`)};r.readAsText(f)};
document.getElementById('parseBtn').onclick=()=>{const t=document.getElementById('csvText').value;if(!t.trim())return toast('Paste CSV or choose a file first');parsedImport=parseSheetCSV(t);renderImportPreview();toast(`Parsed ${parsedImport.forces.length} forces, ${parsedImport.objectives.length} objectives`)};
document.getElementById('applyImportBtn').onclick=()=>{
if(!parsedImport)return;const gid=document.getElementById('importDate').value;if(!gid)return toast('Create a game date first');
const p=parsedImport;
if(p.meta.era&&ERAS.includes(p.meta.era))S.era=p.meta.era;
if(p.meta.mode==='TW'||p.meta.mode==='AS')setMode(p.meta.mode);
p.forces.forEach(f=>{if(!f.brigade||!f.mech)return;const b=brigadeByName(f.brigade);const m=mechForInventory(b,f.mech);if(!m)return;const r=f.pilot?pilotForRoster(b,f.pilot,f.gp):null;b.active.push({mech:m.id,pilot:r?r.id:'',on:true})});
const sc={id:uid(),gameDateId:gid,title:'Imported Contract — '+new Date().toISOString().slice(0,10),type:'Imported',backstory:`[${S.era}] Imported from Sheets CSV${p.meta.exported?` (exported ${p.meta.exported})`:''}.`,objectives:p.objectives.map(o=>({id:uid(),text:o.text,payout:o.payout,enabled:o.enabled,by:o.by?((S.brigades.find(b=>b.name.toLowerCase()===o.by.toLowerCase())||{}).id||''):''})),map:{size:p.map.size||'36x36',loc:p.map.loc||'Unknown',ter:p.map.ter||'Unknown',cond:p.map.cond||'Clear'},opfor:'Imported (as listed)',status:'active',salvage:{}};
S.scenarios.forEach(x=>{if(x.gameDateId===gid&&x.status==='active')x.status='available'});
S.scenarios.push(sc);S.selScenario=sc.id;S.activePredrop=sc.id;parsedImport=null;document.getElementById('csvText').value='';document.getElementById('csvFile').value='';
save();renderAll();renderImportPreview();toast('Import applied — see Brigades & Pre-Drop')};
// SETTINGS
function renderMechRef(){const ref=document.getElementById('mechRef');if(!ref)return;const show=MECHS.slice(0,120);ref.innerHTML=`<p class="hint">Source: ${MECH_SOURCE}. Showing ${show.length} of ${MECHS.length.toLocaleString()} — use Brigade search to find any unit. Icon = battlefield role; weight class is the fallback.</p>`+show.map(m=>`<div class="pill" title="${ROLE_LABELS[m.rl]||m.rl||'Role unknown'} — ${m.wc||''} ${m.tons||''}t ${m.yr||''}">${m.ico} ${m.n} ${m.bv}BV/${m.pv}PV</div>`).join('');const h=ref.previousElementSibling;if(h&&h.tagName==='H3')h.textContent=`Mech Catalog — ${MECHS.length.toLocaleString()} units (BV/PV/C-Bills)`}
renderMechRef();
document.getElementById('seedBtn').onclick=()=>{if(!confirm('Load demo campaign?'))return;S.dates=[{id:uid(),date:new Date().toISOString().slice(0,10),note:'Shop Night — demo',status:'open',locked:false}];
const pick=n=>{const m=MECHS.find(v=>v.n.toLowerCase().includes(n.toLowerCase()))||MECHS[0];const {canon,...rest}=m;return {id:uid(),...rest}};
const b1={id:uid(),name:'Iron Jackals',employer:'Federated Suns',cbills:5200000,inventory:[pick('Marauder MAD-3R'),pick('Hunchback HBK-4G')],roster:[{id:uid(),n:'Vera "Hammer" Kao',g:3,p:4},{id:uid(),n:'Dax Renn',g:4,p:5}],active:[],dropship:true};
b1.active=[{mech:b1.inventory[0].id,pilot:b1.roster[0].id,on:true},{mech:b1.inventory[1].id,pilot:b1.roster[1].id,on:true}];S.brigades=[b1];save();renderAll()};
document.getElementById('wipeBtn').onclick=()=>{if(confirm('Wipe all?')){S={era:ERAS[2],mode:'TW',dates:[],brigades:[],scenarios:[]};save();renderAll()}};
document.getElementById('jsonBtn').onclick=()=>{const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bt-backup.json';a.click()};
document.getElementById('importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{S=JSON.parse(r.result);save();renderAll()};r.readAsText(f)};
function renderAll(){save();renderDates();renderBrigs();renderScens();refreshImportDates()}
renderAll();
