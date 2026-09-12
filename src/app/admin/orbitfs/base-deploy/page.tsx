"use client";
import {useEffect,useMemo,useState} from "react";
import {createClient} from "@/lib/supabase";
import Link from "next/link";

const pretty=(v:any)=>String(v||"—").replaceAll("_"," ");
const customerName=(i:any)=>i.customer?.display_name||i.customer?.company_name||i.customer?.email||"Customer";
const health=(v:any)=>String(v||"unknown").toLowerCase();

export default function OrbitFSBaseDeploy(){
 const sb=useMemo(()=>createClient(),[]),[data,setData]=useState<any>(),[busy,setBusy]=useState(""),[msg,setMsg]=useState(""),[filter,setFilter]=useState("all");
 async function headers():Promise<Record<string,string>>{const {data:{session}}=await sb.auth.getSession();return session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{} }
 async function load(){setBusy("load");const r=await fetch("/api/admin/orbitfs",{headers:await headers(),cache:"no-store"}),j=await r.json().catch(()=>({}));setBusy("");if(!r.ok)return setMsg(j.error||"Could not load OrbitFS control data.");setData(j);setMsg("")}
 useEffect(()=>{void load()},[]);
 async function deploy(installationId:string,action:"deploy"|"redeploy"){if(!confirm(`${action==="deploy"?"Deploy":"Redeploy"} OrbitFS Base for this installation?`))return;setBusy(`${action}:${installationId}`);const r=await fetch("/api/admin/orbitfs/deploy",{method:"POST",headers:{...(await headers()),"content-type":"application/json"},body:JSON.stringify({installationId,action})}),j=await r.json().catch(()=>({}));setBusy("");setMsg(r.ok?`OrbitFS ${action} started.`:j.error||`${action} failed.`);if(r.ok)await load()}
 const installs=(data?.installations||[]),base=data?.latestBase,settings=data?.settings||{},filtered=installs.filter((i:any)=>filter==="all"||filter==="ready"&&i.state==="ready"||filter==="pending"&&!i.release_version||filter==="failed"&&i.state==="failed"),counts={all:installs.length,ready:installs.filter((i:any)=>i.state==="ready").length,pending:installs.filter((i:any)=>!i.release_version).length,failed:installs.filter((i:any)=>i.state==="failed").length};
 return <main className="lmPage">
  <div className="lmHero"><div><div className="lmEyebrow">ORBITFS · ADMIN DEPLOYMENT</div><h1>Base Deploy System</h1><p>Deploy the private Base Panel release to a customer's Vercel account. License entitlement remains authoritative in License Master; this Store admin is the deployment control plane.</p></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><Link className="buttonlink" href="/admin/orbitfs">← My OrbitFS</Link><button onClick={()=>void load()} disabled={busy==="load"}>{busy==="load"?"Refreshing…":"Refresh"}</button></div></div>
  <div className="lmGrid2">
   <section className="lmCard"><div className="lmKicker">CURRENT RELEASE</div><div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-start"}}><div><h2>{base?.version||"No published Base release"}</h2><p>{base?.title||"Publish a Base release in License Master before deploying."}</p></div>{base&&<span className="state ready">{base.status}</span>}</div><div className="lmKV"><div><span>Release channel</span><b>{base?.channel||"base"}</b></div><div><span>Rollout</span><b>{base?.rollout||"—"}</b></div><div><span>Schema</span><b>{base?.schemaVersion||settings.schema_version||"—"}</b></div><div><span>Release ID</span><b>{base?.releaseId||"—"}</b></div></div></section>
   <section className="lmCard"><div className="lmKicker">CONTROL PLANE</div><h2>Deployment gates</h2><div className="lmRuntimeList"><div><b>License Master</b><span>Entitlement, installation identity and release authority.</span></div><div><b>Store Admin</b><span>Chooses the customer installation and starts deployment.</span></div><div><b>Customer accounts</b><span>Vercel hosts the Panel; Supabase remains the customer's database.</span></div><div><b>Customer Portal</b><span>Reads installation state from the Store control-plane data, never from the admin UI.</span></div></div></section>
  </div>
  <section className="lmCard" style={{marginTop:14}}><header><div><div className="lmKicker">INSTALLATIONS</div><h2>Base deployment queue</h2><p>Deploy, redeploy and inspect customer installations without exposing Store credentials.</p></div></header>
   <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"4px 0 16px"}}>{(["all","pending","ready","failed"] as const).map(x=><button key={x} className={filter===x?"primary":"secondary"} onClick={()=>setFilter(x)}>{x[0].toUpperCase()+x.slice(1)} <span style={{opacity:.7}}>({counts[x]})</span></button>)}</div>
   {filtered.length?<div className="lmReleaseList">{filtered.map((i:any)=>{const deployed=!!i.release_version,action=deployed?"redeploy":"deploy",h=health(i.health_status),working=busy===`${action}:${i.id}`;return <div className="lmRelease" key={i.id}><div><b>{customerName(i)}</b><small>{i.installation_id||i.id} · {pretty(i.state)} · {deployed?`Base ${i.release_version}`:"Base not deployed"}</small><p>{i.vercel_project_name||"No Vercel project"}{i.supabase_project_name?` · ${i.supabase_project_name}`:""}</p></div><span className={`state ${h==="healthy"?"ready":h==="failed"?"error":"waiting"}`}>{h}</span><div className="actions"><button className="primary" disabled={!!busy||!base||!settings.enabled||!settings.customer_deploy_enabled} onClick={()=>void deploy(i.id,action)}>{working?"Working…":action==="deploy"?"Deploy Base":"Redeploy"}</button></div></div>})}</div>:<div className="lmEmpty">No installations match this filter.</div>}
   {msg&&<div className="lmNotice" style={{marginTop:14}}>{msg}</div>}
  </section>
  <section className="lmCard" style={{marginTop:14}}><div className="lmKicker">SAFETY</div><h2>Release boundaries</h2><p className="muted">The Store never sends its service-role credentials to a customer deployment. Customer Supabase and Vercel credentials are kept in the deployment secret flow. Published Base packages are retrieved through the License Master release service.</p></section>
 </main>;
}
