import {masterLicenseValidate,masterRequest} from "@/lib/master-api";

export const runtime="nodejs";
export async function POST(req:Request){
  try{
    const body=await req.json();
    const auth=await masterLicenseValidate({...body,components:["orbitfs_mcp","orbitfs_apex","orbitfs_studio"],activate:false});
    const entitled=Object.entries(auth.components||{}).filter(([,v]:any)=>v?.allowed===true).map(([k])=>k);
    if(!entitled.length)return Response.json({error:"Licence is not entitled to an OrbitFS Engine component",code:"ENGINE_RELEASE_NOT_ENTITLED"},{status:403});
    const result=await masterRequest(`/api/v1/releases/latest?component=orbitfs_engine&channel=${encodeURIComponent(body?.channel||"stable")}`);
    return Response.json({release:{...result.release,distribution:"orbitfs-store-package-v1"},installationId:body.installationId||body.installation_id,entitledComponents:entitled});
  }catch(e:any){return Response.json({error:e.message||"Engine release service failed",code:e.code||"ENGINE_RELEASE_SERVICE_ERROR"},{status:e.status||500})}
}
export async function OPTIONS(){return new Response(null,{status:204})}
