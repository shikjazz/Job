import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Briefcase, User, Search, Plus, Save, ExternalLink, Mail, Sparkles, Upload, Download, CalendarCheck, Users, Trash2, Copy, LogOut, LogIn, FileText, BarChart3, Bell, Globe } from 'lucide-react';
import './style.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const localKey = 'job-command-center-local';
const seedJobs = [];
  
  
const statuses = ['Not Applied','Saved','Applied','Interview','Offer','Rejected'];
const focuses = ['All','Physical Design','RTL Design','Verification','EDA','Software','Other'];
const priorities = ['All','High','Medium','Low'];

function today(){ return new Date().toISOString().slice(0,10); }
function addDays(n){ const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
function daysSince(date){ if(!date) return null; return Math.floor((new Date() - new Date(date+'T00:00:00'))/86400000); }
function moneyStatus(s){ return ({Offer:'offer',Interview:'interview',Applied:'applied',Rejected:'rejected',Saved:'saved'})[s] || 'open'; }
function readLocal(){ try { return JSON.parse(localStorage.getItem(localKey)) || seedJobs; } catch { return seedJobs; } }
function saveLocal(jobs){ localStorage.setItem(localKey, JSON.stringify(jobs)); }

const profileDefault = {
  name:'Chinmayee Ganthakoru', email:'chinmayee.4673@gmail.com', phone:'+1-623-759-9750', linkedin:'https://linkedin.com/in/chinmayee-ganthakoru-1a5934251',
  headline:'MSEE candidate at Arizona State University, graduating May 2026',
  summary:'Hands-on RTL-to-GDSII experience at 7nm and 32nm nodes. Skilled in Synopsys and Cadence EDA tools, Verilog, SystemVerilog, UVM, Python, Tcl, STA, DRC/LVS, and physical implementation.',
  achievements:'GCN hardware accelerator at ASAP 7nm PDK: 0.098mm², 13mW, 8.8ns latency\n12.1% area reduction and 69% power savings on 32nm RISC-V design\nFull RTL-to-GDSII flow: synthesis, floorplanning, placement, CTS, routing, STA, DRC/LVS, GDSII sign-off'
};

function template(profile, job, type){
  const bullets = (profile.achievements || '').split('\n').filter(Boolean).slice(0,4).map(x=>'• '+x).join('\n');
  if(type==='follow') return `Subject: Following Up — ${job.title} Application\n\nDear Hiring Team,\n\nI hope you are doing well. I am following up on my application for the ${job.title} role at ${job.company}${job.applied_date ? `, submitted ${daysSince(job.applied_date)} days ago` : ''}.\n\nI remain very interested in this opportunity. My background in ${job.focus || 'semiconductor design'} and hands-on RTL-to-GDSII project work aligns strongly with the role.\n\nThank you for your time and consideration.\n\nBest regards,\n${profile.name}\n${profile.email} | ${profile.phone}`;
  if(type==='linkedin') return `Hi, I’m ${profile.name}. I’m an ${profile.headline}. I’m interested in the ${job.title} role at ${job.company}.\n\nMy background includes ${job.focus || 'semiconductor design'}, RTL-to-GDSII work, and EDA tools. I’d be grateful for any guidance about the role or team. Thank you!`;
  if(type==='resume') return `${profile.name}\n${profile.email} | ${profile.phone} | ${profile.linkedin}\n\nTARGET ROLE\n${job.title} — ${job.company}\n\nSUMMARY\n${profile.summary}\n\nSELECTED ACHIEVEMENTS\n${bullets}\n\nTAILORING NOTES\nEmphasize: ${job.focus}, ${job.priority} priority fit, ${job.notes || 'match experience to job description.'}`;
  return `Dear Hiring Manager,\n\nI am excited to apply for the ${job.title} role at ${job.company}. I am ${profile.headline}, with hands-on experience in ${job.focus || 'semiconductor design'} and strong project experience across RTL-to-GDSII implementation.\n\nRelevant highlights include:\n${bullets}\n\nMy experience with Synopsys, Cadence, Verilog/SystemVerilog, UVM, Python, Tcl, Linux, physical implementation, and verification workflows would allow me to contribute effectively to ${job.company}.\n\nThank you for your time and consideration.\n\nSincerely,\n${profile.name}\n${profile.email} | ${profile.phone}\n${profile.linkedin}`;
}

function App(){
  const [session,setSession]=useState(null); const [jobs,setJobs]=useState([]); const [profile,setProfile]=useState(profileDefault); const [view,setView]=useState('jobs');
  const [q,setQ]=useState(''); const [status,setStatus]=useState('All'); const [focus,setFocus]=useState('All'); const [priority,setPriority]=useState('All');
  const [job,setJob]=useState({company:'',title:'',location:'',url:'',focus:'Physical Design',priority:'High',notes:''}); const [selected,setSelected]=useState(null); const [tpl,setTpl]=useState('cover'); const [copied,setCopied]=useState(false); const [authEmail,setAuthEmail]=useState(''); const [aiLoading,setAiLoading]=useState(false);

  useEffect(()=>{ init(); },[]);
  async function init(){
    if(supabase){ const {data:{session}}=await supabase.auth.getSession(); setSession(session); supabase.auth.onAuthStateChange((_e,s)=>{setSession(s); load(s);}); await load(session); }
    else { setJobs(readLocal()); const p=localStorage.getItem('jcc-profile'); if(p) setProfile(JSON.parse(p)); }
  }
  async function load(s=session){
    if(supabase && s){ const {data}=await supabase.from('jobs').select('*').order('created_at',{ascending:false}); setJobs(data?.length?data:[]); const {data:p}=await supabase.from('profiles').select('*').single(); if(p) setProfile({...profileDefault,...p}); }
    else setJobs(readLocal());
  }
  async function persist(next){ setJobs(next); if(supabase && session){} else saveLocal(next); }
  async function upsertJob(row){
    if(supabase && session){ const {data,error}=await supabase.from('jobs').upsert(row).select().single(); if(!error){ setJobs(cur=>[data,...cur.filter(x=>x.id!==data.id)]); } }
    else { const next=[row,...jobs.filter(x=>x.id!==row.id)]; persist(next); }
  }
  async function patch(id,patch){ const next=jobs.map(j=>j.id===id?{...j,...patch}:j); persist(next); if(supabase && session) await supabase.from('jobs').update(patch).eq('id',id); }
  async function remove(id){ const next=jobs.filter(j=>j.id!==id); persist(next); if(supabase && session) await supabase.from('jobs').delete().eq('id',id); }
  async function addJob(){ if(!job.company||!job.title) return; await upsertJob({id:crypto.randomUUID(),...job,status:'Not Applied',applied_date:'',followup_date:'',referral_name:'',referral_contact:'',interview_date:'',interview_notes:'',resume_url:'',created_at:new Date().toISOString()}); setJob({company:'',title:'',location:'',url:'',focus:'Physical Design',priority:'High',notes:''}); }
  async function saveProfile(){ localStorage.setItem('jcc-profile',JSON.stringify(profile)); if(supabase && session) await supabase.from('profiles').upsert(profile); alert('Profile saved'); }
  async function login(){ if(!supabase) return alert('Add Supabase env keys first.'); await supabase.auth.signInWithOtp({email:authEmail}); alert('Check email for login link.'); }
  async function logout(){ if(supabase) await supabase.auth.signOut(); setSession(null); }
  function exportJson(){ const blob=new Blob([JSON.stringify({profile,jobs},null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='job-command-center-backup.json'; a.click(); URL.revokeObjectURL(url); }
  function importJson(e){ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ const data=JSON.parse(r.result); if(data.profile) setProfile(data.profile); if(Array.isArray(data.jobs)) persist(data.jobs); }; r.readAsText(f); }
  async function uploadResume(e){ const file=e.target.files?.[0]; if(!file) return; if(!supabase||!session) return alert('Resume upload to cloud needs Supabase login. Use Export/Import for local backup.'); const path=`${session.user.id}/${Date.now()}-${file.name}`; const {error}=await supabase.storage.from('resumes').upload(path,file,{upsert:true}); if(error) return alert(error.message); const {data}=supabase.storage.from('resumes').getPublicUrl(path); setProfile({...profile,resume_url:data.publicUrl}); alert('Resume uploaded'); }
  async function aiTemplate(){ if(!selected) return; setAiLoading(true); try{ const res=await fetch('/api/generate-template',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile,job:selected,type:tpl})}); const data=await res.json(); if(data.text){ await navigator.clipboard.writeText(data.text); setCopied(true); setTimeout(()=>setCopied(false),1200); } else alert(data.error||'AI not configured'); } finally { setAiLoading(false); } }

  const filtered=useMemo(()=>jobs.filter(j=>(status==='All'||j.status===status)&&(focus==='All'||j.focus===focus)&&(priority==='All'||j.priority===priority)&&(!q||`${j.company} ${j.title} ${j.location} ${j.notes}`.toLowerCase().includes(q.toLowerCase()))),[jobs,q,status,focus,priority]);
  const stats=useMemo(()=>Object.fromEntries(statuses.map(s=>[s,jobs.filter(j=>j.status===s).length])),[jobs]);
  const due=jobs.filter(j=>j.status==='Applied'&&j.applied_date&&daysSince(j.applied_date)>=7); const appliedToday=jobs.filter(j=>j.applied_date===today()).length; const interviews=jobs.filter(j=>j.status==='Interview');
  const text=selected?template(profile,selected,tpl):'';

  return <div className="app"><header><div><h1><Briefcase/> Job Application Command Center</h1><p>Cloud-ready tracker for applications, referrals, interviews, reminders, resumes, and templates.</p></div><nav>{['jobs','analytics','profile','interviews'].map(v=><button className={view===v?'active':''} onClick={()=>setView(v)} key={v}>{v}</button>)}{session?<button onClick={logout}><LogOut size={16}/>Logout</button>:<span className="login"><input placeholder="email for magic link" value={authEmail} onChange={e=>setAuthEmail(e.target.value)}/><button onClick={login}><LogIn size={16}/>Login</button></span>}</nav></header>
  <main>
    {view==='analytics'&&<section className="grid"><Card title="Applied today" icon={<BarChart3/>} value={appliedToday}/><Card title="Follow-ups due" icon={<Bell/>} value={due.length}/><Card title="Interviews" icon={<CalendarCheck/>} value={interviews.length}/><Card title="Total jobs" icon={<Briefcase/>} value={jobs.length}/><div className="panel wide"><h2>Status breakdown</h2>{statuses.map(s=><div className="bar" key={s}><span>{s}</span><b style={{width:`${jobs.length?stats[s]/jobs.length*100:0}%`}}></b><em>{stats[s]}</em></div>)}</div></section>}
    {view==='profile'&&<section className="panel"><h2><User/> Candidate Profile</h2><div className="form two">{['name','email','phone','linkedin','headline'].map(k=><input key={k} value={profile[k]||''} placeholder={k} onChange={e=>setProfile({...profile,[k]:e.target.value})}/>) }<textarea value={profile.summary||''} onChange={e=>setProfile({...profile,summary:e.target.value})} placeholder="summary"/><textarea value={profile.achievements||''} onChange={e=>setProfile({...profile,achievements:e.target.value})} placeholder="achievements, one per line"/></div><div className="actions"><button onClick={saveProfile}><Save/>Save profile</button><label className="button"><Upload/>Upload resume<input type="file" hidden onChange={uploadResume}/></label><button onClick={exportJson}><Download/>Backup data</button><label className="button"><Upload/>Import backup<input type="file" hidden accept="application/json" onChange={importJson}/></label></div><p className="hint">Cloud resume upload needs Supabase Storage. Local mode still works with JSON backup/export.</p></section>}
    {view==='interviews'&&<section className="panel"><h2><CalendarCheck/> Interview Tracker</h2>{interviews.length?interviews.map(j=><div className="item" key={j.id}><b>{j.company}</b><span>{j.title}</span><input type="date" value={j.interview_date||''} onChange={e=>patch(j.id,{interview_date:e.target.value})}/><textarea value={j.interview_notes||''} onChange={e=>patch(j.id,{interview_notes:e.target.value})} placeholder="prep notes, interviewer names, questions asked"/></div>):<p>No interviews yet. When a job status becomes Interview, it appears here.</p>}</section>}
    {view==='jobs'&&<><section className="cards">{statuses.map(s=><button key={s} className={'stat '+moneyStatus(s)} onClick={()=>setStatus(status===s?'All':s)}><b>{stats[s]}</b><span>{s}</span></button>)}</section>{due.length>0&&<div className="alert"><Bell/> {due.length} follow-up reminder(s) due. Open a job template and copy the follow-up email.</div>}<section className="layout"><div><div className="panel"><h2><Plus/> Add Job</h2><div className="form two"><input placeholder="Company" value={job.company} onChange={e=>setJob({...job,company:e.target.value})}/><input placeholder="Job title" value={job.title} onChange={e=>setJob({...job,title:e.target.value})}/><input placeholder="Location" value={job.location} onChange={e=>setJob({...job,location:e.target.value})}/><input placeholder="Application URL" value={job.url} onChange={e=>setJob({...job,url:e.target.value})}/><select value={job.focus} onChange={e=>setJob({...job,focus:e.target.value})}>{focuses.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select><select value={job.priority} onChange={e=>setJob({...job,priority:e.target.value})}>{priorities.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select><textarea placeholder="Notes / job description / referral info" value={job.notes} onChange={e=>setJob({...job,notes:e.target.value})}/></div><button onClick={addJob}><Plus/>Add job</button></div><div className="panel"><div className="filters"><Search/><input placeholder="Search jobs" value={q} onChange={e=>setQ(e.target.value)}/><select value={status} onChange={e=>setStatus(e.target.value)}>{['All',...statuses].map(x=><option key={x}>{x}</option>)}</select><select value={focus} onChange={e=>setFocus(e.target.value)}>{focuses.map(x=><option key={x}>{x}</option>)}</select><select value={priority} onChange={e=>setPriority(e.target.value)}>{priorities.map(x=><option key={x}>{x}</option>)}</select></div>{filtered.map(j=><article className="job" key={j.id}><div><h3>{j.company} <span className={moneyStatus(j.status)}>{j.status}</span></h3><p><b>{j.title}</b></p><p>{j.location} · {j.focus} · {j.priority}</p><small>{j.notes}</small>{j.applied_date&&<small>Applied {daysSince(j.applied_date)} days ago</small>}</div><div className="jobActions">{j.url&&<a href={j.url} target="_blank"><ExternalLink/>Apply page</a>}<button onClick={()=>patch(j.id,{status:'Applied',applied_date:today(),followup_date:addDays(7)})}>Mark applied</button><button onClick={()=>{setSelected(j);setTpl('cover')}}><Mail/>Templates</button><select value={j.status} onChange={e=>patch(j.id,{status:e.target.value,applied_date:e.target.value==='Applied'&&!j.applied_date?today():j.applied_date})}>{statuses.map(s=><option key={s}>{s}</option>)}</select><input placeholder="Referral name" value={j.referral_name||''} onChange={e=>patch(j.id,{referral_name:e.target.value})}/><button className="danger" onClick={()=>remove(j.id)}><Trash2/></button></div></article>)}</div></div><aside className="panel"><h2><FileText/> Templates & Resume Tailoring</h2>{selected?<><p><b>{selected.company}</b><br/>{selected.title}</p><div className="tabs">{['cover','follow','linkedin','resume'].map(x=><button className={tpl===x?'active':''} onClick={()=>setTpl(x)} key={x}>{x}</button>)}</div><textarea className="template" value={text} readOnly/><button onClick={async()=>{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1200)}}><Copy/>{copied?'Copied':'Copy'}</button><button onClick={aiTemplate} disabled={aiLoading}><Sparkles/>{aiLoading?'Generating...':'AI generate & copy'}</button><p className="hint">AI button works after adding OPENAI_API_KEY in Vercel/local env.</p></>:<p>Select “Templates” on any job.</p>}<hr/><h3><Globe/> One-click job saving</h3><p className="hint">A Chrome extension starter is included in the /extension folder. Load it as an unpacked extension after deployment/customization.</p></aside></section></>}
  </main><footer>Built for direct browser use. Uses Supabase cloud when configured; otherwise falls back to local browser storage.</footer></div>
}
function Card({title,value,icon}){ return <div className="panel card">{icon}<span>{title}</span><b>{value}</b></div> }
createRoot(document.getElementById('root')).render(<App/>);
