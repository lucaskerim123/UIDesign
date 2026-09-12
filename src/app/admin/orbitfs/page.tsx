"use client";
import Link from "next/link";

const items=[
 {title:"License Controller",href:"/admin/license-controller",eyebrow:"LICENSING · CONTROL",text:"Control activation, suspension, installation locks, key rotation and termination through License Master."},
 {title:"Base Deploy System",href:"/admin/orbitfs/base-deploy",eyebrow:"DEPLOYMENT · BASE",text:"Deploy and redeploy the OrbitFS Base Panel into customer Vercel accounts using the private release pipeline."},
 {title:"Update Release Deployer",href:"/admin/orbitfs/update-release-deployer",eyebrow:"RELEASES · UPDATES",text:"Take a published Base update and explicitly deploy it to selected customer installations."}
];
export default function MyOrbitFSAdmin(){return <main className="lmPage"><div className="lmHero"><div><div className="lmEyebrow">ORBITFS CONTROL PLANE</div><h1>My OrbitFS</h1><p>The primary administrator area for OrbitFS licensing, Base deployment and customer release updates.</p></div></div><section className="lmGrid2">{items.map(item=><Link className="lmCard" href={item.href} key={item.href} style={{textDecoration:"none"}}><div className="lmKicker">{item.eyebrow}</div><h2>{item.title}</h2><p className="muted">{item.text}</p><span style={{display:"inline-block",marginTop:14}}>Open →</span></Link>)}</section><section className="lmCard" style={{marginTop:14}}><header><div><div className="lmKicker">BOUNDARY</div><h2>How the three systems fit</h2></div></header><div className="lmRuntimeList"><div><b>License Controller</b><span>License Master remains the authority. Billing Store routes administrator controls to it.</span></div><div><b>Base Deploy System</b><span>Customer installation → customer Supabase → customer Vercel Panel.</span></div><div><b>Update Release Deployer</b><span>Published release → selected installation → existing Vercel project, without replacing the customer database.</span></div></div></section></main>;
}
