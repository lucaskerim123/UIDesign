"use client";
import Link from "next/link";

const items=[
 {title:"Releases",href:"/admin/releases",eyebrow:"RELEASE SYSTEM · UPDATES",text:"Manage OrbitFS Base releases published by License Master. Updates come from the V1-vercel-base release-updates branch."},
 {title:"Base Deployment",href:"/admin/orbitfs/base-deploy",eyebrow:"DEPLOYMENT · BASE",text:"Deploy and redeploy the OrbitFS Base Panel. Base deployment releases come from the V1-vercel-base base-release branch."}
];
export default function MyOrbitFSAdmin(){return <main className="lmPage"><div className="lmHero"><div><div className="lmEyebrow">ORBITFS CONTROL PLANE</div><h1>My OrbitFS</h1><p>OrbitFS release and Base deployment control. License authority remains in License Master.</p></div></div><section className="lmGrid2">{items.map(item=><Link className="lmCard" href={item.href} key={item.href} style={{textDecoration:"none"}}><div className="lmKicker">{item.eyebrow}</div><h2>{item.title}</h2><p className="muted">{item.text}</p><span style={{display:"inline-block",marginTop:14}}>Open →</span></Link>)}</section></main>;
}
