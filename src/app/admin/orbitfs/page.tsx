"use client";
import Link from "next/link";

const items=[
 {title:"Releases",href:"/admin/releases",eyebrow:"RELEASE SYSTEM · UPDATES",text:"Manage OrbitFS releases published by License Master. Base release source is V1-vercel-base; existing-installation update candidates use V1-vercel-engine / UPDATE_RELEASE."},
 {title:"Base Deployment",href:"/admin/orbitfs/base-deploy",eyebrow:"DEPLOYMENT · BASE",text:"Deploy and redeploy the OrbitFS Base Panel from the licensed Base release. Deployment is separate from the update-release source."}
];
export default function MyOrbitFSAdmin(){return <main className="lmPage"><div className="lmHero"><div><div className="lmEyebrow">ORBITFS CONTROL PLANE</div><h1>My OrbitFS</h1><p>OrbitFS release and Base deployment control. License authority remains in License Master.</p></div></div><section className="lmGrid2">{items.map(item=><Link className="lmCard" href={item.href} key={item.href} style={{textDecoration:"none"}}><div className="lmKicker">{item.eyebrow}</div><h2>{item.title}</h2><p className="muted">{item.text}</p><span style={{display:"inline-block",marginTop:14}}>Open →</span></Link>)}</section></main>;
}
