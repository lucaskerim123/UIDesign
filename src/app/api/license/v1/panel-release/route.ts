import {masterLicenseValidate,masterRequest} from "@/lib/master-api";

export const runtime="nodejs";
export async function POST(req:Request){
  try{
    const body=await req.json();
    const auth=await masterLicenseValidate({...body,components:["orbitfs_base"],activate:false});
    if(auth.components?.orbitfs_base?.allowed!==true)return Response.json({error:"Licence is not valid for OrbitFS Base release access",code:"PANEL_RELEASE_LICENSE_INVALID"},{status:403});
    const result=await masterRequest(`/api/v1/releases/latest?component=orbitfs_base&channel=${encodeURIComponent(body?.channel||"base")}`);
    const r=result.release;
    return Response.json({release:{...r,distribution:"orbitfs-store-package-v1"},installationId:body.installationId||body.installation_id,entitledComponent:"orbitfs_base"});
  }catch(e:any){return Response.json({error:e.message||"Panel release service failed",code:e.code||"PANEL_RELEASE_SERVICE_ERROR"},{status:e.status||500})}
}
export async function OPTIONS(){return new Response(null,{status:204})}
