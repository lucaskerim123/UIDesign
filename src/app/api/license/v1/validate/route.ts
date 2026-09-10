import {bodyOf,cors,reply} from "@/lib/license-api";
import {masterValidate} from "@/lib/master-api";

export async function POST(req:Request){
  const body=await bodyOf(req);
  try{return reply(await masterValidate({
    licenseKey:body.licenseKey||body.license_key,
    installationId:body.installationId||body.installation_id,
    components:Array.isArray(body.components)?body.components.map((x:any)=>String(x)):undefined,
    activate:!!body.activate,
    deviceName:body.deviceName||null,
    platform:body.platform||null,
    appVersion:body.appVersion||null
  }))}
  catch(error:any){return reply(error?.data||{error:error?.message||"Master licence validation failed",code:"MASTER_LICENSE_VALIDATION_ERROR"},error?.status||502)}
}

export async function OPTIONS(){return new Response(null,{status:204,headers:cors})}
